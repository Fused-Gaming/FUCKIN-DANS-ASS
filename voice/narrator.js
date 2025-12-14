// Voice narration system - Gives your projects personality!
const player = require('play-sound')({}); // Auto-detect player
const path = require('path');
const fs = require('fs');

// Get voice settings from environment
const VOICE_ENABLED = process.env.VOICE_ENABLED === 'true';
const VOICE_CHARACTER = process.env.VOICE_CHARACTER || 'archer';

// Sound mappings for different events (will auto-detect .mp3 or .wav)
const SOUND_EVENTS = {
  // Success events
  'contracts_found': 'contracts_found',
  'database_saved': 'database_saved',
  'query_complete': 'query_complete',

  // Error events
  'error': 'error',
  'validation_failed': 'validation_failed',

  // Special moments
  'startup': 'startup',
  'danger_zone': 'danger_zone'
};

/**
 * Play a voice narration for a specific event
 * @param {string} eventName - The event to narrate
 * @param {object} data - Optional data for context
 */
function narrate(eventName, data = {}) {
  if (!VOICE_ENABLED) {
    return; // Voice disabled, skip
  }

  const soundFile = SOUND_EVENTS[eventName];
  if (!soundFile) {
    console.log(`[Voice] Unknown event: ${eventName}`);
    return;
  }

  // Try both .mp3 and .wav extensions
  let soundPath = path.join(__dirname, 'sounds', VOICE_CHARACTER, `${soundFile}.mp3`);
  if (!fs.existsSync(soundPath)) {
    soundPath = path.join(__dirname, 'sounds', VOICE_CHARACTER, `${soundFile}.wav`);
  }

  // Check if sound file exists
  if (!fs.existsSync(soundPath)) {
    console.log(`[Voice] Sound not found for event '${eventName}'`);
    console.log(`[Voice] Add ${soundFile}.mp3 or ${soundFile}.wav to: voice/sounds/${VOICE_CHARACTER}/`);
    return;
  }

  // Play the sound
  try {
    player.play(soundPath, (err) => {
      if (err) {
        console.log(`[Voice] Playback error: ${err.message}`);
      }
    });
  } catch (error) {
    console.log(`[Voice] Failed to play: ${error.message}`);
  }
}

/**
 * Get available voice characters
 */
function getAvailableCharacters() {
  const soundsDir = path.join(__dirname, 'sounds');

  if (!fs.existsSync(soundsDir)) {
    return [];
  }

  return fs.readdirSync(soundsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Check if voice system is properly configured
 */
function checkVoiceSetup() {
  if (!VOICE_ENABLED) {
    return { enabled: false, reason: 'Voice disabled in .env' };
  }

  const soundsDir = path.join(__dirname, 'sounds', VOICE_CHARACTER);

  if (!fs.existsSync(soundsDir)) {
    return {
      enabled: false,
      reason: `Character '${VOICE_CHARACTER}' sounds not found`,
      path: soundsDir
    };
  }

  const files = fs.readdirSync(soundsDir);
  const mp3Files = files.filter(f => f.endsWith('.mp3'));

  return {
    enabled: true,
    character: VOICE_CHARACTER,
    soundsFound: mp3Files.length,
    availableEvents: mp3Files.map(f => f.replace('.mp3', ''))
  };
}

module.exports = {
  narrate,
  getAvailableCharacters,
  checkVoiceSetup,
  VOICE_ENABLED,
  VOICE_CHARACTER
};

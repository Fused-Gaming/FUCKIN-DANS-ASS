// Test voice narration system
require('dotenv').config();
const { narrate, checkVoiceSetup } = require('./narrator');

console.log("=".repeat(80));
console.log("VOICE NARRATION TEST");
console.log("=".repeat(80));

// Check setup
const setup = checkVoiceSetup();
console.log("\nVoice Setup Status:");
console.log(JSON.stringify(setup, null, 2));

console.log("\n" + "=".repeat(80));
console.log("Playing startup sound...");
console.log("=".repeat(80));

// Play test sound
narrate('startup');

console.log("\nIf you heard audio, IT WORKS!");
console.log("If not, check:");
console.log("1. VOICE_ENABLED=true in .env");
console.log("2. Audio file exists in voice/sounds/archer/");
console.log("3. Windows has a default media player configured");

setTimeout(() => {
  process.exit(0);
}, 3000); // Give it 3 seconds to play

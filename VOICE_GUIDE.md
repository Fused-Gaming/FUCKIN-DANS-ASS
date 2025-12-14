# Voice Narration System - Make Your Projects Talk! 🎙️

Your terminal now has PERSONALITY! Each project can have its own voice character that narrates important moments.

## How It Works

- **Archer voice** = alchemy-api project (spy/blockchain intel vibes)
- **Krieger voice** = ML/AI projects (mad scientist energy)
- **Pam voice** = Database/data projects (chaos and cocaine... I mean data)
- Different voice = instant audio identification for which project you're in!

## Quick Start

### 1. Enable Voice in .env

Already done! Check your `.env`:
```env
VOICE_ENABLED=true
VOICE_CHARACTER=archer
```

### 2. Test It Works

```bash
node voice/test-voice.js
```

You should hear: *"Do you want blockchain data? Because that's how you get blockchain data."*

### 3. Run Your Scripts

```bash
npm run getContracts
# Archer narrates when contracts are found!
```

## Adding Your Own Voice Clips

### Option 1: Use AI Voice Generation (RECOMMENDED)

**Using ElevenLabs (Best Quality):**
1. Go to elevenlabs.io
2. Generate voice clips with Archer/Pam/Krieger voice
3. Download as MP3
4. Save to `voice/sounds/archer/`

**Using Uberduck or FakeYou:**
1. Generate Archer character voice
2. Download MP3
3. Save to character folder

### Option 2: Use Windows Speech Synthesis (Quick & Free)

Already have a script for this:
```bash
powershell -ExecutionPolicy Bypass -File voice/generate-test-sound.ps1
```

Generates WAV files (works but sounds robotic).

### Option 3: Record Your Own

1. Do your best Archer impression
2. Save as MP3
3. Drop in `voice/sounds/archer/`

## Voice Events & Sound Files Needed

Create these files in `voice/sounds/archer/`:

### Success Events
- `contracts_found.mp3` - "Boom! Found contracts. Nailed it."
- `database_saved.mp3` - "And... saved to database. You're welcome."
- `query_complete.mp3` - "Mission accomplished."

### Error Events
- `error.mp3` - "Well that's not good."
- `validation_failed.mp3` - "Seriously? Check your input."

### Special Moments
- `startup.mp3` - "Do you want blockchain data? Because that's how you get blockchain data."
- `danger_zone.mp3` - "DANGER ZONE!" (plays on risky operations)

## Suggested Voice Lines (Archer Character)

Copy these into your voice gen tool:

**contracts_found.mp3:**
> "Boom! Found {count} contracts. And that's how you do intelligence gathering, people."

**database_saved.mp3:**
> "Saved to database with query ID {id}. You're welcome."

**error.mp3:**
> "Well... that's not good. Also, why are we screaming?"

**validation_failed.mp3:**
> "Seriously? Invalid address. It's like you're not even trying."

**query_complete.mp3:**
> "And... done. Nailed it. Now where's my drink?"

**danger_zone.mp3:**
> "DANGER ZONE!" (Just the classic line)

## Creating Other Characters

### For Krieger (ML/AI projects):

```bash
mkdir voice/sounds/krieger
```

Then in your AI project's `.env`:
```env
VOICE_CHARACTER=krieger
```

**Krieger voice lines:**
- "Also, yes! Neural network trained successfully!"
- "It's alive! ALIVE!"
- "Don't judge me, but I may have created a sentient AI."

### For Pam (Database projects):

```bash
mkdir voice/sounds/pam
```

**Pam voice lines:**
- "Holy shitsnacks! Look at all this data!"
- "WOOO! Database query complete!"
- "Sploosh! Found what you needed!"

## File Format Support

The system supports both:
- `.mp3` (preferred - smaller files)
- `.wav` (works but larger)

It auto-detects which format you have.

## Advanced: Add New Events

Edit `voice/narrator.js`:

```javascript
const SOUND_EVENTS = {
  'your_new_event': 'your_sound_file',
  // ... other events
};
```

Then in your script:
```javascript
const { narrate } = require('./voice/narrator');

narrate('your_new_event', { custom: 'data' });
```

## Disabling Voice

Set in `.env`:
```env
VOICE_ENABLED=false
```

Or comment it out. Scripts work fine with voice disabled.

## Troubleshooting

### "No sound plays"

1. Check `VOICE_ENABLED=true` in `.env`
2. Verify sound files exist: `dir voice\sounds\archer`
3. Make sure Windows has a default media player
4. Run test: `node voice/test-voice.js`

### "Sound file not found"

The narrator tells you exactly what file it's looking for. Add that file to `voice/sounds/{character}/`

### "Wrong character voice"

Check `VOICE_CHARACTER` in `.env` - must match folder name in `voice/sounds/`

## Example Workflow

```bash
# Working on blockchain project
cd alchemy-api
npm run getContracts
# *Archer voice* "Boom! Found contracts..."

# Switch to ML project
cd ../ml-project
npm run train
# *Krieger voice* "Also, yes! Training complete!"

# Switch to database project
cd ../data-warehouse
npm run query
# *Pam voice* "Holy shitsnacks! Query complete!"
```

You instantly know which project you're in BY SOUND! 🎯

## Contributing Voice Packs

Got great voice clips? Share them! (Without copyright issues, of course)

Create a `voice-pack-{character}.zip` with all the sound files and share with the team.

---

**Now go make your terminal talk!** 🎤

*"LANAAAAAAA!"* - Archer, probably

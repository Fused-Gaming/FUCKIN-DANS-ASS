# 🎙️ ElevenLabs Custom Voice Character Setup Guide

## Complete Setup for Voice-Enabled Forensic Toolkit

This guide will help you integrate your custom ElevenLabs voice character with Claude Code MCP for voice narration of forensic investigations.

---

## 📋 Prerequisites

- ✅ Python 3.12 installed
- ✅ ElevenLabs account (https://elevenlabs.io)
- ✅ Claude Desktop app (for MCP integration)
- ✅ API key from ElevenLabs

---

## 🎯 Step-by-Step Setup

### Step 1: Get Your ElevenLabs API Key

1. Go to: https://elevenlabs.io/app/settings/api-keys
2. Click **"Create API Key"** or copy existing key
3. Save it somewhere safe - you'll need it in Step 3

### Step 2: Create/Clone Your Voice Character

#### Option A: Clone Your Own Voice (Recommended for Archer character)

1. Go to: https://elevenlabs.io/app/voice-lab
2. Click **"Add a new voice"** → **"Voice Design"** or **"Instant Voice Cloning"**
3. **For Instant Cloning**:
   - Upload 1-5 minutes of clear audio of your voice (or character voice)
   - Best results: Clean audio, no background noise
   - Click "Add voice"
4. **Get Voice ID**:
   - Click on your new voice
   - Copy the **Voice ID** (format: `pNInz6obpgDQGcFmaJgB`)
   - Save this - you'll use it in commands

#### Option B: Use Pre-Made Character Voices

1. Go to Voice Library: https://elevenlabs.io/voice-library
2. Browse character voices
3. Add to your account
4. Get Voice ID from your voices list

#### Popular Character Voices for Forensics:
- **Adam** (`pNInz6obpgDQGcFmaJgB`) - Deep, authoritative
- **Antoni** (`ErXwobaYiN019PkySvjV`) - Professional, clear
- **Josh** (`TxGEqnHWrfWFTfGW9XjX`) - Confident narrator
- **Rachel** (`21m00Tcm4TlvDq8ikWAM`) - Default, clear female

### Step 3: Configure Environment Variables

Add your API key to `.env`:

```bash
# Open k:\git\alchemy-api\.env
# Add this line:
ELEVENLABS_API_KEY=sk_your_actual_api_key_here
```

**Full .env example:**
```env
# Alchemy API
ALCHEMY_API_KEY=your_alchemy_key

# ElevenLabs Voice (NEW!)
ELEVENLABS_API_KEY=sk_1234567890abcdef

# Other RPC URLs...
ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/your_key
```

### Step 4: Configure Claude Desktop MCP

Edit your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the MCP server:

```json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "python",
      "args": [
        "K:\\git\\alchemy-api\\voicesoundsarcher\\elevenlabs_mcp.py"
      ],
      "env": {
        "ELEVENLABS_API_KEY": "sk_your_actual_api_key_here"
      }
    }
  }
}
```

**Important**: Update the path to match your actual installation directory!

### Step 5: Restart Claude Desktop

1. Completely quit Claude Desktop (check system tray)
2. Relaunch Claude Desktop
3. Look for MCP connection indicator (usually bottom-left or in settings)

### Step 6: Test Your Setup

In Claude Desktop, try this command:

```
Use elevenlabs_list_voices to show available voices
```

You should see a list of all your voices including your custom character.

Then test speech generation:

```
Use elevenlabs_text_to_speech with:
- text: "This is Archer. Forensic investigation is beginning."
- voice_id: YOUR_VOICE_ID
- save_to_file: "K:/git/alchemy-api/test-voice.mp3"
```

### Step 7: Integrate with Forensics Toolkit

Now you can narrate forensic operations! Examples:

#### Example 1: Narrate Investigation Start
```
Use elevenlabs_text_to_speech with:
- text: "Beginning forensic investigation of illegal casino operations. Importing threat intelligence database."
- voice_id: YOUR_ARCHER_VOICE_ID
- save_to_file: "K:/git/alchemy-api/investigations/case-001-start.mp3"
```

#### Example 2: Narrate Address Flagging
```
Use elevenlabs_text_to_speech with:
- text: "Critical alert. Address zero x zero nine eight B seven one six B flagged as Ronin Bridge hacker. Risk level: Critical. Estimated theft: six hundred twenty-five million dollars."
- voice_id: YOUR_VOICE_ID
- save_to_file: "K:/git/alchemy-api/investigations/flagged-address.mp3"
```

#### Example 3: Narrate Terminal Output
```
Use elevenlabs_narrate_terminal with:
- terminal_output: "[Full terminal output from forensics tool]"
- voice_id: YOUR_VOICE_ID
- clean_output: true
- save_to_file: "K:/git/alchemy-api/investigations/terminal-log.mp3"
```

---

## 🎤 Available MCP Tools

### 1. `elevenlabs_text_to_speech`
Convert any text to speech

**Parameters:**
- `text` (required): Text to speak (max 5000 chars)
- `voice_id` (optional): Your custom voice ID
- `model_id` (optional): Model to use (default: `eleven_monolingual_v1`)
- `voice_settings` (optional): Fine-tune stability, similarity, style
- `save_to_file` (optional): Path to save MP3

### 2. `elevenlabs_narrate_terminal`
Narrate terminal/agent output with automatic cleaning

**Parameters:**
- `terminal_output` (required): Raw terminal text
- `voice_id` (optional): Your voice ID
- `clean_output` (default: true): Remove ANSI codes
- `include_summary` (default: false): Add summary prefix
- `save_to_file` (optional): Save path

### 3. `elevenlabs_list_voices`
List all available voices

**Parameters:**
- `response_format` (default: markdown): Output format
- `category` (optional): Filter by category
- `limit` (optional): Max voices to return

### 4. `elevenlabs_get_voice`
Get details about specific voice

**Parameters:**
- `voice_id` (required): Voice to query
- `response_format` (default: markdown): Output format

---

## 🎛️ Voice Settings Fine-Tuning

For optimal Archer character voice:

```json
{
  "voice_settings": {
    "stability": 0.6,
    "similarity_boost": 0.8,
    "style": 0.3,
    "use_speaker_boost": true
  }
}
```

**Settings Explained:**
- **stability** (0.0-1.0): Higher = more consistent, Lower = more expressive
  - Forensics: 0.5-0.7 (professional but dynamic)
- **similarity_boost** (0.0-1.0): Higher = closer to original voice
  - Use 0.75-0.9 for character accuracy
- **style** (0.0-1.0): Exaggeration level (v2 models only)
  - Archer character: 0.2-0.4 (subtle personality)
- **use_speaker_boost**: true for better clarity

---

## 🔊 Forensic Investigation Voice Scenarios

### Scenario 1: Case Opening
```
"Beginning Case C A S E dash twenty twenty-four dash Dan dash zero zero one.
Target: Illegal casino operations using Dan alias.
Importing verified threat intelligence database.
Stand by for analysis."
```

### Scenario 2: Address Flagging
```
"Alert. Critical risk address detected.
Address zero x zero nine eight B flagged as Ronin Bridge exploiter.
Associated with Lazarus Group.
Six hundred twenty-five million dollars stolen.
Proceed with extreme caution."
```

### Scenario 3: Fund Flow Detection
```
"Fund movement detected.
Source address to mixing contract Tornado Cash.
Amount: One hundred point five ethereum.
Flagging for money laundering investigation."
```

### Scenario 4: Report Generation
```
"Forensic report generation complete.
Case I D: C A S E dash Dan dash zero zero one.
Total addresses analyzed: fifteen.
Flagged entities: seven.
Evidence exported in J S O N, C S V, and markdown formats.
Investigation ready for law enforcement submission."
```

---

## 🛠️ Troubleshooting

### Issue: "ELEVENLABS_API_KEY not set"
**Solution:** Check `.env` file has the key, restart Claude Desktop

### Issue: "Invalid API key"
**Solution:** Verify key at https://elevenlabs.io/app/settings/api-keys

### Issue: "Voice ID not found"
**Solution:**
1. List voices: `elevenlabs_list_voices`
2. Copy correct voice ID
3. Use exact format (case-sensitive)

### Issue: MCP server not connecting
**Solution:**
1. Check `claude_desktop_config.json` path is correct
2. Verify Python path: `python --version` (should be 3.12)
3. Check MCP logs in Claude Desktop settings
4. Restart Claude Desktop completely

### Issue: Audio not saving
**Solution:**
- Check path exists or use full path
- Ensure write permissions
- Create directory first if needed

---

## 📊 Cost Considerations

ElevenLabs Pricing (as of 2024):
- **Free Tier**: 10,000 characters/month
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters

**Forensic Use Estimate:**
- Average case narration: ~2,000 characters
- Alert notifications: ~500 characters each
- Full investigation: ~5,000-10,000 characters

**Tip:** Use text-to-speech for critical narrations only to stay within limits.

---

## 🔐 Security Best Practices

1. **Never commit API keys** - Use `.env` (already in `.gitignore`)
2. **Rotate keys regularly** - Generate new keys monthly
3. **Use read-only keys** when possible
4. **Monitor usage** at https://elevenlabs.io/app/usage
5. **Secure audio files** - Store investigation narrations securely

---

## 🚀 Quick Start Command

Once setup is complete, try this complete workflow:

```
1. Import intelligence:
   npm run forensics → "Import Threat Intelligence"

2. Generate case opening narration:
   Use elevenlabs_text_to_speech with:
   - text: "Beginning forensic investigation. Imported 10 known security incidents and 15 flagged addresses totaling over 3 billion dollars in tracked losses."
   - voice_id: YOUR_VOICE_ID
   - save_to_file: "K:/git/alchemy-api/investigations/case-start.mp3"

3. Check flagged address:
   npm run forensics → "Check Address Reputation" → 0x098B716B...

4. Narrate result:
   Use elevenlabs_text_to_speech with:
   - text: "Address confirmed as Ronin Bridge hacker. Critical risk. Six hundred twenty-five million stolen."
   - voice_id: YOUR_VOICE_ID
   - save_to_file: "K:/git/alchemy-api/investigations/address-alert.mp3"
```

---

## 📞 Support

- **ElevenLabs Docs**: https://docs.elevenlabs.io/
- **ElevenLabs Support**: https://help.elevenlabs.io/
- **Claude MCP Docs**: https://docs.anthropic.com/mcp
- **Project Issues**: https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/issues

---

**You're now ready to conduct voice-narrated blockchain forensic investigations!** 🎙️🔍

# ElevenLabs MCP Server - Terminal Narration

A Model Context Protocol (MCP) server for integrating ElevenLabs text-to-speech capabilities with terminal outputs, agent logs, and command results. Perfect for creating audio narration of your development workflows.

## Features

- 🎙️ **Text-to-Speech Conversion** - High-quality audio generation using ElevenLabs API
- 🖥️ **Terminal Output Narration** - Automatically clean and narrate shell outputs
- 🎭 **Multiple Voices** - Access all ElevenLabs voices (premade, cloned, professional)
- 🔧 **Customizable Settings** - Control stability, similarity, style, and more
- 💾 **File Output** - Save generated audio to disk
- 🧹 **Smart Cleaning** - Automatic ANSI code removal and formatting

## Installation

### 1. Install Dependencies

```bash
cd C:\Users\thepr\projects\elevenlabs-mcp
pip install -r requirements.txt
```

### 2. Get ElevenLabs API Key

1. Visit https://elevenlabs.io/app/settings
2. Copy your API key
3. Set environment variable:

**Windows (PowerShell):**
```powershell
$env:ELEVENLABS_API_KEY = "your-api-key-here"
```

**Windows (CMD):**
```cmd
set ELEVENLABS_API_KEY=your-api-key-here
```

**Permanent (Windows):**
```powershell
[System.Environment]::SetEnvironmentVariable('ELEVENLABS_API_KEY', 'your-api-key-here', 'User')
```

### 3. Test the Server

```bash
python elevenlabs_mcp.py --help
```

## Usage with Claude Desktop

### Configure MCP Settings

Add to your Claude Desktop MCP configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "python",
      "args": ["C:\\Users\\thepr\\projects\\elevenlabs-mcp\\elevenlabs_mcp.py"],
      "env": {
        "ELEVENLABS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools Available

### 1. `elevenlabs_text_to_speech`

Convert any text to speech with customizable voice settings.

**Parameters:**
- `text` (required): Text to convert (max 5000 chars)
- `voice_id` (optional): Voice ID (default: Rachel)
- `model_id` (optional): TTS model (default: eleven_monolingual_v1)
- `voice_settings` (optional): Custom stability, similarity, style settings
- `output_format` (optional): Audio format (default: mp3_44100_128)
- `save_to_file` (optional): Path to save audio file

**Example:**
```python
{
  "text": "Hello! This is a test of the ElevenLabs integration.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "save_to_file": "output.mp3"
}
```

### 2. `elevenlabs_narrate_terminal`

Narrate terminal output with automatic cleanup of ANSI codes and formatting.

**Parameters:**
- `terminal_output` (required): Raw terminal output
- `voice_id` (optional): Voice to use
- `clean_output` (optional): Auto-clean artifacts (default: true)
- `save_to_file` (optional): Save path
- `include_summary` (optional): Add summary prefix (default: false)

**Example:**
```python
{
  "terminal_output": "$ npm install\nnpm WARN deprecated...\n✓ Installation complete",
  "clean_output": true,
  "save_to_file": "install_log.mp3"
}
```

### 3. `elevenlabs_list_voices`

List all available voices with filtering options.

**Parameters:**
- `response_format` (optional): "markdown" or "json" (default: markdown)
- `category` (optional): Filter by category
- `limit` (optional): Max voices to return

**Example:**
```python
{
  "category": "premade",
  "limit": 10,
  "response_format": "markdown"
}
```

### 4. `elevenlabs_get_voice`

Get detailed information about a specific voice.

**Parameters:**
- `voice_id` (required): Voice ID to retrieve
- `response_format` (optional): Output format

**Example:**
```python
{
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "response_format": "json"
}
```

## Practical Use Cases

### 1. Narrate Build Output

```python
# In Claude Desktop
"Can you narrate the build output from my last command?"

# Claude will use:
elevenlabs_narrate_terminal({
  "terminal_output": "...",
  "save_to_file": "build_output.mp3"
})
```

### 2. Agent Workflow Narration

```python
# Narrate each step of an agent's work
"Please narrate the steps you're taking for this task"

# Saves audio summaries of agent actions
```

### 3. Error Report Reading

```python
# Convert error logs to speech for review while debugging
"Read me the error log from the last run"
```

### 4. CI/CD Status Updates

```python
# Get audio notifications of deployment status
"Narrate the deployment log"
```

## Voice Settings Guide

### Stability (0.0 - 1.0)
- **Low (0.0-0.3)**: More expressive, variable delivery
- **Medium (0.4-0.6)**: Balanced (recommended)
- **High (0.7-1.0)**: Very consistent, monotone

### Similarity Boost (0.0 - 1.0)
- **Low (0.0-0.3)**: More creative interpretation
- **Medium (0.4-0.6)**: Balanced
- **High (0.7-1.0)**: Closer to original voice

### Style (0.0 - 1.0) - V2 Models Only
- **Low (0.0)**: Minimal style exaggeration
- **High (1.0)**: Maximum style emphasis

### Speaker Boost
- **true**: Enhanced clarity and consistency (recommended)
- **false**: Natural voice without enhancement

## Popular Voice IDs

- **Rachel** (Female): `21m00Tcm4TlvDq8ikWAM` (default)
- **Drew** (Male): `29vD33N1CtxCmqQRPOHJ`
- **Clyde** (Male): `2EiwWnXFnvU5JabPnv8n`

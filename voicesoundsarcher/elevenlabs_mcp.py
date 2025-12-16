#!/usr/bin/env python3
"""
ElevenLabs MCP Server - Terminal Narration Integration

This MCP server provides text-to-speech narration capabilities using ElevenLabs API,
specifically designed for narrating terminal outputs, agent logs, and command results.

Features:
- Text-to-speech conversion with multiple voices
- Voice management and listing
- Audio file generation and streaming
- Terminal output narration with formatting cleanup
- Agent conversation narration
"""

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from enum import Enum
import httpx
import os
import json
import base64
import asyncio
from pathlib import Path
from datetime import datetime


# Initialize MCP server
mcp = FastMCP("elevenlabs_mcp")

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
BASE_URL = "https://api.elevenlabs.io/v1"
DEFAULT_VOICE_ID = "xwuILeKa8H5ulXd0SB5j"  # Archers voice


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def _get_api_client() -> httpx.AsyncClient:
    """Create configured HTTP client for ElevenLabs API."""
    if not ELEVENLABS_API_KEY:
        raise ValueError(
            "ELEVENLABS_API_KEY environment variable not set. "
            "Please set your API key from https://elevenlabs.io/app/settings"
        )
    
    return httpx.AsyncClient(
        base_url=BASE_URL,
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        timeout=60.0
    )


def _handle_api_error(e: Exception) -> str:
    """Format API errors with actionable messages."""
    if isinstance(e, httpx.HTTPStatusError):
        status = e.response.status_code
        if status == 401:
            return "Error: Invalid API key. Please check your ELEVENLABS_API_KEY."
        elif status == 403:
            return "Error: Access forbidden. Check your API key permissions."
        elif status == 404:
            return "Error: Resource not found. Please verify the voice ID or endpoint."
        elif status == 429:
            return "Error: Rate limit exceeded. Please wait before retrying."
        elif status == 422:
            try:
                detail = e.response.json()
                return f"Error: Validation failed - {detail}"
            except:
                return "Error: Invalid input parameters."
        return f"Error: API request failed with status {status}"
    elif isinstance(e, httpx.TimeoutException):
        return "Error: Request timed out. Please try again."
    elif isinstance(e, ValueError):
        return f"Error: {str(e)}"
    return f"Error: Unexpected error - {type(e).__name__}: {str(e)}"


def _clean_terminal_output(text: str) -> str:
    """Clean terminal output for better narration."""
    import re
    
    # Remove ANSI escape codes
    text = re.sub(r'\x1b\[[0-9;]*m', '', text)
    
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Clean up common terminal artifacts
    text = re.sub(r'[\r\x00]', '', text)
    
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    
    return text.strip()


def _log_event(log_path: Path, payload: Dict[str, Any]) -> None:
    """Append structured event data to a log file without secrets."""
    try:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        safe_payload = {k: v for k, v in payload.items() if k != "audio_base64"}
        safe_payload["timestamp"] = datetime.utcnow().isoformat() + "Z"
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(safe_payload, ensure_ascii=False) + "\n")
    except Exception:
        # Logging should never break the main flow
        pass


def _summarize_terminal_output(text: str, max_lines: int = 6, tail_lines: int = 2) -> tuple[str, dict[str, int]]:
    """Extract the most relevant lines for concise narration."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    stats = {"errors": 0, "warnings": 0, "success": 0}

    if not lines:
        return "No readable output found.", stats

    scored = []
    for idx, line in enumerate(lines):
        lower = line.lower()
        score = 0

        if any(key in lower for key in ["error", "failed", "exception", "fatal", "traceback"]):
            score = 3
            stats["errors"] += 1
        elif any(key in lower for key in ["warn", "deprecated", "caution", "retry"]):
            score = 2
            stats["warnings"] += 1
        elif any(key in lower for key in ["success", "completed", "done", "ready", "listening", "started", "connected"]):
            score = 1
            stats["success"] += 1

        scored.append((score, idx, line))

    # Always include tail lines for context
    tail_indices = set(range(max(0, len(lines) - tail_lines), len(lines)))

    # Sort by severity (score desc) then original order
    scored.sort(key=lambda item: (-item[0], item[1]))
    selected_indices = []
    for score, idx, _ in scored:
        if len(selected_indices) >= max_lines:
            break
        if idx not in selected_indices:
            selected_indices.append(idx)

    # Merge with tail context
    selected_indices = sorted(set(selected_indices) | tail_indices)
    selected_indices = selected_indices[:max_lines]

    focused_lines = [lines[i] for i in selected_indices]

    # Build concise summary text
    signals = []
    if stats["errors"]:
        signals.append(f"errors: {stats['errors']}")
    if stats["warnings"]:
        signals.append(f"warnings: {stats['warnings']}")
    if stats["success"]:
        signals.append(f"success signals: {stats['success']}")

    signal_text = ", ".join(signals) if signals else "no notable signals"
    focused_text = "; ".join(focused_lines)

    return f"Archer terminal summary — {signal_text}. Key lines: {focused_text}", stats


def _format_voice_info(voice: Dict[str, Any], format_type: str = "markdown") -> str:
    """Format voice information for display."""
    if format_type == "json":
        return json.dumps(voice, indent=2)
    
    # Markdown format
    output = f"### {voice['name']} ({voice['voice_id']})\n\n"
    output += f"- **Category**: {voice.get('category', 'N/A')}\n"
    output += f"- **Description**: {voice.get('description', 'No description')}\n"
    
    if 'labels' in voice and voice['labels']:
        labels = ', '.join(f"{k}: {v}" for k, v in voice['labels'].items())
        output += f"- **Labels**: {labels}\n"
    
    if 'preview_url' in voice:
        output += f"- **Preview**: {voice['preview_url']}\n"
    
    return output


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ResponseFormat(str, Enum):
    """Output format options."""
    MARKDOWN = "markdown"
    JSON = "json"


class VoiceSettings(BaseModel):
    """Voice settings for TTS generation."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    stability: float = Field(
        default=0.5,
        description="Voice stability (0.0-1.0). Higher = more consistent, Lower = more expressive",
        ge=0.0,
        le=1.0
    )
    similarity_boost: float = Field(
        default=0.75,
        description="Voice similarity (0.0-1.0). Higher = closer to original voice",
        ge=0.0,
        le=1.0
    )
    style: Optional[float] = Field(
        default=0.0,
        description="Style exaggeration (0.0-1.0). Only for v2 models",
        ge=0.0,
        le=1.0
    )
    use_speaker_boost: bool = Field(
        default=True,
        description="Enable speaker boost for better clarity"
    )


class TextToSpeechInput(BaseModel):
    """Input for text-to-speech conversion."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True, extra='forbid')
    
    text: str = Field(
        ...,
        description="Text to convert to speech (max 5000 characters for standard, 1000 for streaming)",
        min_length=1,
        max_length=5000
    )
    voice_id: Optional[str] = Field(
        default=None,
        description=f"Voice ID to use (default: {DEFAULT_VOICE_ID} - Rachel). Use list_voices to see options"
    )
    model_id: str = Field(
        default="eleven_monolingual_v1",
        description="Model to use: eleven_monolingual_v1, eleven_multilingual_v2, eleven_turbo_v2"
    )
    voice_settings: Optional[VoiceSettings] = Field(
        default=None,
        description="Custom voice settings (uses defaults if not specified)"
    )
    output_format: Literal["mp3_44100_128", "pcm_16000", "pcm_22050", "pcm_24000"] = Field(
        default="mp3_44100_128",
        description="Audio output format"
    )
    save_to_file: Optional[str] = Field(
        default=None,
        description="Optional file path to save audio (e.g., 'output.mp3')"
    )
    log_to_file: Optional[str] = Field(
        default=None,
        description="Optional log file path to append request/response metadata"
    )
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Validate and clean text input."""
        if not v.strip():
            raise ValueError("Text cannot be empty")
        return v.strip()


class NarrateTerminalInput(BaseModel):
    """Input for narrating terminal output."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    terminal_output: str = Field(
        ...,
        description="Terminal output text to narrate (will be cleaned automatically)",
        min_length=1
    )
    voice_id: Optional[str] = Field(
        default=None,
        description="Voice ID to use (default: Rachel)"
    )
    clean_output: bool = Field(
        default=True,
        description="Clean ANSI codes and terminal artifacts before narration"
    )
    save_to_file: Optional[str] = Field(
        default=None,
        description="Optional file path to save audio"
    )
    include_summary: bool = Field(
        default=False,
        description="Add a brief summary before narrating full output"
    )
    log_to_file: Optional[str] = Field(
        default=None,
        description="Optional log file path to append request/response metadata"
    )


class FocusNarrateInput(BaseModel):
    """Input for concise, signal-focused terminal narration."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True, extra='forbid')

    terminal_output: str = Field(
        ...,
        description="Raw terminal output text",
        min_length=1
    )
    voice_id: Optional[str] = Field(
        default=None,
        description="Voice ID to use (default: Rachel)"
    )
    clean_output: bool = Field(
        default=True,
        description="Clean ANSI codes and terminal artifacts before narration"
    )
    max_lines: int = Field(
        default=6,
        description="Maximum key lines to include in narration",
        ge=1,
        le=20
    )
    tail_lines: int = Field(
        default=2,
        description="Number of tail lines to keep for context",
        ge=0,
        le=5
    )
    save_to_file: Optional[str] = Field(
        default=None,
        description="Optional file path to save audio"
    )
    log_to_file: Optional[str] = Field(
        default=None,
        description="Optional log file path to append request/response metadata"
    )


class ListVoicesInput(BaseModel):
    """Input for listing available voices."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for machine-readable"
    )
    category: Optional[str] = Field(
        default=None,
        description="Filter by category (e.g., 'premade', 'cloned', 'professional')"
    )
    limit: Optional[int] = Field(
        default=None,
        description="Maximum number of voices to return",
        ge=1,
        le=100
    )


class GetVoiceInput(BaseModel):
    """Input for getting voice details."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    voice_id: str = Field(
        ...,
        description="Voice ID to retrieve details for",
        min_length=1
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format"
    )


# ============================================================================
# MCP TOOLS
# ============================================================================

@mcp.tool(
    name="elevenlabs_text_to_speech",
    annotations={
        "title": "Convert Text to Speech",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def text_to_speech(params: TextToSpeechInput) -> str:
    """Convert text to speech using ElevenLabs API.
    
    This tool generates high-quality speech audio from text input using ElevenLabs'
    text-to-speech models. Supports multiple voices, models, and output formats.
    
    Args:
        params (TextToSpeechInput): Input parameters containing:
            - text (str): Text to convert (max 5000 chars)
            - voice_id (Optional[str]): Voice to use (default: Rachel)
            - model_id (str): TTS model (default: eleven_monolingual_v1)
            - voice_settings (Optional[VoiceSettings]): Custom voice configuration
            - output_format (str): Audio format (default: mp3_44100_128)
            - save_to_file (Optional[str]): Path to save audio file
    
    Returns:
        str: Success message with file path or base64 audio data
        
    Examples:
        - Basic usage: text="Hello world", voice_id=None (uses default)
        - Custom voice: text="Important message", voice_id="pNInz6obpgDQGcFmaJgB"
        - Save to file: text="Save this", save_to_file="greeting.mp3"
    """
    try:
        voice_id = params.voice_id or DEFAULT_VOICE_ID
        
        # Build request payload
        payload = {
            "text": params.text,
            "model_id": params.model_id,
            "output_format": params.output_format
        }
        
        # Add voice settings if provided
        if params.voice_settings:
            payload["voice_settings"] = {
                "stability": params.voice_settings.stability,
                "similarity_boost": params.voice_settings.similarity_boost,
                "style": params.voice_settings.style,
                "use_speaker_boost": params.voice_settings.use_speaker_boost
            }
        
        # Make API request
        async with await _get_api_client() as client:
            response = await client.post(
                f"/text-to-speech/{voice_id}",
                json=payload
            )
            response.raise_for_status()
            audio_data = response.content

        # Log metadata if requested
        if params.log_to_file:
            _log_event(
                Path(params.log_to_file).expanduser(),
                {
                    "event": "tts_request",
                    "voice_id": voice_id,
                    "model_id": params.model_id,
                    "output_format": params.output_format,
                    "text_length": len(params.text),
                    "audio_bytes": len(audio_data),
                    "saved_to_file": bool(params.save_to_file)
                }
            )
        
        # Save to file if requested
        if params.save_to_file:
            output_path = Path(params.save_to_file).expanduser()
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, "wb") as f:
                f.write(audio_data)
            
            return f"✅ Audio generated successfully!\n\nSaved to: {output_path}\nSize: {len(audio_data):,} bytes\nFormat: {params.output_format}"
        
        # Return base64-encoded audio
        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
        return f"✅ Audio generated successfully!\n\nSize: {len(audio_data):,} bytes\nFormat: {params.output_format}\n\nBase64 audio data (truncated):\n{audio_b64[:100]}...\n\n💡 Use save_to_file parameter to save audio to disk."
        
    except Exception as e:
        return _handle_api_error(e)


@mcp.tool(
    name="elevenlabs_narrate_terminal",
    annotations={
        "title": "Narrate Terminal Output",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def narrate_terminal(params: NarrateTerminalInput) -> str:
    """Narrate terminal output with automatic cleanup and formatting.
    
    This tool is specifically designed for narrating shell commands, agent outputs,
    and terminal logs. It automatically cleans ANSI codes, removes artifacts, and
    formats the text for optimal speech narration.
    
    Args:
        params (NarrateTerminalInput): Input parameters containing:
            - terminal_output (str): Raw terminal output to narrate
            - voice_id (Optional[str]): Voice to use (default: Rachel)
            - clean_output (bool): Clean terminal artifacts (default: True)
            - save_to_file (Optional[str]): Path to save audio
            - include_summary (bool): Add summary prefix (default: False)
    
    Returns:
        str: Success message with narration details
        
    Examples:
        - Basic: terminal_output="Command completed successfully\nExit code: 0"
        - Agent log: terminal_output="[INFO] Processing request...\n[SUCCESS] Complete"
        - With summary: terminal_output="...", include_summary=True
    """
    try:
        # Clean terminal output if requested
        text_to_narrate = params.terminal_output
        if params.clean_output:
            text_to_narrate = _clean_terminal_output(text_to_narrate)
        
        # Add summary if requested
        if params.include_summary:
            lines = text_to_narrate.split('\n')
            word_count = len(text_to_narrate.split())
            summary = f"Terminal output summary: {len(lines)} lines, approximately {word_count} words. "
            text_to_narrate = summary + text_to_narrate
        
        # Validate length
        if len(text_to_narrate) > 5000:
            return f"Error: Terminal output too long ({len(text_to_narrate)} chars). Maximum is 5000 characters. Consider splitting into chunks."
        
        if not text_to_narrate.strip():
            return "Error: No text to narrate after cleaning."
        
        # Create TTS input
        tts_params = TextToSpeechInput(
            text=text_to_narrate,
            voice_id=params.voice_id,
            save_to_file=params.save_to_file,
            log_to_file=params.log_to_file
        )
        
        # Generate speech
        result = await text_to_speech(tts_params)
        
        return f"🎙️ Terminal Narration Complete\n\n{result}\n\nOriginal length: {len(params.terminal_output)} chars\nCleaned length: {len(text_to_narrate)} chars"
        
    except Exception as e:
        return _handle_api_error(e)


@mcp.tool(
    name="elevenlabs_narrate_terminal_focus",
    annotations={
        "title": "Narrate Terminal Output (Focused)",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def narrate_terminal_focus(params: FocusNarrateInput) -> str:
    """Narrate terminal output with severity-aware summarization.

    This variant keeps the signal high by selecting error, warning, and success
    lines, plus a small tail for context. It is designed for quick, non-noisy
    narration in active terminals.
    """
    try:
        text_to_process = params.terminal_output
        if params.clean_output:
            text_to_process = _clean_terminal_output(text_to_process)

        summary_text, stats = _summarize_terminal_output(
            text_to_process,
            max_lines=params.max_lines,
            tail_lines=params.tail_lines
        )

        # Validate length
        if len(summary_text) > 2000:
            summary_text = summary_text[:2000]

        tts_params = TextToSpeechInput(
            text=summary_text,
            voice_id=params.voice_id,
            save_to_file=params.save_to_file,
            log_to_file=params.log_to_file
        )

        result = await text_to_speech(tts_params)

        return (
            "🎙️ Focused Terminal Narration Complete\n\n"
            f"{result}\n\n"
            f"Signals → errors: {stats['errors']}, warnings: {stats['warnings']}, success: {stats['success']}\n"
            f"Lines considered: {len(text_to_process.splitlines())}, max narrated: {params.max_lines}"
        )

    except Exception as e:
        return _handle_api_error(e)


@mcp.tool(
    name="elevenlabs_list_voices",
    annotations={
        "title": "List Available Voices",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def list_voices(params: ListVoicesInput) -> str:
    """List all available voices from ElevenLabs.
    
    Retrieves all voices available to your account, including premade voices,
    cloned voices, and professionally designed voices. Useful for discovering
    voice options for narration.
    
    Args:
        params (ListVoicesInput): Input parameters containing:
            - response_format (ResponseFormat): Output format (default: markdown)
            - category (Optional[str]): Filter by category
            - limit (Optional[int]): Maximum voices to return
    
    Returns:
        str: Formatted list of available voices with details
        
    Examples:
        - List all: response_format="markdown"
        - Filter: category="premade", limit=10
        - JSON output: response_format="json"
    """
    try:
        async with await _get_api_client() as client:
            response = await client.get("/voices")
            response.raise_for_status()
            data = response.json()
        
        voices = data.get("voices", [])
        
        # Filter by category if specified
        if params.category:
            voices = [v for v in voices if v.get("category") == params.category]
        
        # Apply limit if specified
        if params.limit:
            voices = voices[:params.limit]
        
        # Format output
        if params.response_format == ResponseFormat.JSON:
            return json.dumps({"voices": voices, "total": len(voices)}, indent=2)
        
        # Markdown format
        output = f"# Available Voices ({len(voices)} total)\n\n"
        
        for voice in voices:
            output += _format_voice_info(voice, "markdown")
            output += "\n---\n\n"
        
        return output.strip()
        
    except Exception as e:
        return _handle_api_error(e)


@mcp.tool(
    name="elevenlabs_get_voice",
    annotations={
        "title": "Get Voice Details",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def get_voice(params: GetVoiceInput) -> str:
    """Get detailed information about a specific voice.
    
    Retrieves complete details for a voice including settings, samples,
    and metadata. Useful for understanding voice characteristics before use.
    
    Args:
        params (GetVoiceInput): Input parameters containing:
            - voice_id (str): Voice ID to retrieve
            - response_format (ResponseFormat): Output format
    
    Returns:
        str: Detailed voice information
    """
    try:
        async with await _get_api_client() as client:
            response = await client.get(f"/voices/{params.voice_id}")
            response.raise_for_status()
            voice = response.json()
        
        if params.response_format == ResponseFormat.JSON:
            return json.dumps(voice, indent=2)
        
        return _format_voice_info(voice, "markdown")
        
    except Exception as e:
        return _handle_api_error(e)


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()

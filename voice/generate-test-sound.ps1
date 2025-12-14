# Generate test audio using Windows Speech Synthesis
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Archer voice line
$synth.SetOutputToWaveFile("voice\sounds\archer\startup.wav")
$synth.Speak("Do you want blockchain data? Because that's how you get blockchain data.")
$synth.Dispose()

Write-Host "Test audio generated at voice\sounds\archer\startup.wav"
Write-Host "Note: You'll need to convert WAV to MP3 or use voice clips from ElevenLabs/similar"

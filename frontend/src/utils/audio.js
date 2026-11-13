/**
 * Converts an AudioBuffer into a standard 16-bit PCM WAV Blob.
 * Universally readable by librosa and soundfile without external codecs.
 */
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let samples;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    samples = new Float32Array(left.length + right.length);
    let index = 0;
    for (let i = 0; i < left.length; i++) {
      samples[index++] = left[i];
      samples[index++] = right[i];
    }
  } else {
    samples = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Converts recorded browser audio chunks (WebM/Ogg) into a clean .wav File.
 */
export async function convertBlobToWavFile(blob, filename = 'mic_sample_5s.wav') {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWav(audioBuffer);
    await audioCtx.close();
    return new File([wavBlob], filename, { type: 'audio/wav' });
  } catch (err) {
    console.warn('WAV conversion fallback used:', err);
    // If WebAudio decode fails, preserve original blob with .wav suffix for API
    return new File([blob], filename, { type: blob.type || 'audio/wav' });
  }
}

/**
 * Generates a clean synthetic 2-second audio chime WAV for quick testing
 * when microphone or external audio is unavailable.
 */
export function generateTestWavFile() {
  const sampleRate = 22050;
  const duration = 2.5;
  const numSamples = Math.floor(sampleRate * duration);
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx({ sampleRate });
  const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Multi-frequency harmonic tone simulating voice formant
    const f1 = 440 * Math.sin(2 * Math.PI * 220 * t);
    const f2 = 220 * Math.sin(2 * Math.PI * 440 * t);
    const f3 = 110 * Math.sin(2 * Math.PI * 880 * t);
    const envelope = Math.exp(-t * 1.2);
    data[i] = ((f1 + f2 + f3) / 3) * envelope * 0.7;
  }

  const wavBlob = audioBufferToWav(buffer);
  audioCtx.close();
  return new File([wavBlob], 'demo_voice_tone.wav', { type: 'audio/wav' });
}

import io
import os
import base64
import tempfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import librosa
import librosa.display

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Dhwani Kavach API", version="0.25")

# Enable CORS for all origins (*)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ready",
        "project": "Dhwani Kavach",
        "milestone": "v0.25"
    }


@app.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        
        # Save temporarily for robust audio reading (.wav, .mp3, etc.)
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_file:
            temp_path = temp_file.name
            temp_file.write(contents)

        try:
            # Load audio using librosa (sr=None preserves original sampling rate)
            y, sr = librosa.load(temp_path, sr=None)

            duration = librosa.get_duration(y=y, sr=sr)
            peak_amp = np.max(np.abs(y)) if len(y) > 0 else 0.0
            
            # Compute MFCC and mean MFCC
            mfcc = librosa.feature.mfcc(y=y, sr=sr)
            mfcc_mean = float(np.mean(mfcc)) if mfcc.size > 0 else 0.0

            # Generate dark-background Mel-Spectrogram PNG
            with plt.style.context('dark_background'):
                fig, ax = plt.subplots(figsize=(10, 4))
                S = librosa.feature.melspectrogram(y=y, sr=sr)
                S_dB = librosa.power_to_db(S, ref=np.max)
                img = librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel', ax=ax, cmap='magma')
                fig.colorbar(img, ax=ax, format='%+2.0f dB')
                ax.set_title(f'Mel-Spectrogram - {file.filename}')
                plt.tight_layout()

                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
                plt.close(fig)
                buf.seek(0)
                img_base64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')

            return {
                "status": "success",
                "filename": file.filename,
                "spectrogram_base64": img_base64,
                "duration": round(float(duration), 2),
                "sample_rate": int(sr),
                "peak_amplitude": round(float(peak_amp), 4),
                "mfcc_mean": round(float(mfcc_mean), 2),
            }

        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


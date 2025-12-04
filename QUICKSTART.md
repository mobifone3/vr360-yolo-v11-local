# Quick Start Guide - YOLOv12 API Server with Ngrok

## Installation

### Option 1: Automated Installation (Recommended)
Run the batch file:
```cmd
install.bat
```

### Option 2: Manual Installation
Open PowerShell or Command Prompt and run:

```powershell
# Step 1: Upgrade pip
python -m pip install --upgrade pip

# Step 2: Install core dependencies
python -m pip install flask pyngrok python-dotenv requests

# Step 3: Install PyTorch (this will take a few minutes)
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Step 4: Install computer vision libraries
python -m pip install numpy pillow opencv-python

# Step 5: Install YOLO
python -m pip install ultralytics
```

## Running the Server

```powershell
python app.py
```

The server will:
1. ✅ Load your ngrok auth token from `.env`
2. ✅ Start ngrok tunnel automatically
3. ✅ Display local URL: `http://127.0.0.1:5000`
4. ✅ Display public URL: `https://xxxxx.ngrok.io`

## Testing the API

### Test 1: Health Check
Open browser or use curl:
```powershell
curl http://127.0.0.1:5000/health
```

### Test 2: Detect Objects
```powershell
python test_client.py path\to\your\image.jpg
```

### Test 3: Using the Public URL
From any device:
```
https://xxxxx.ngrok.io/health
```

## Troubleshooting

### If numpy installation fails:
Python 3.14 is very new and some packages may need time to release compatible wheels. You can:

1. **Downgrade to Python 3.12** (recommended):
   - Uninstall Python 3.14
   - Install Python 3.12 from https://www.python.org/downloads/
   - Run install.bat again

2. **Wait for the build** (takes 5-10 minutes):
   - Let the numpy installation complete
   - It will compile from source

### If port 5000 is in use:
Edit `.env`:
```
PORT=8080
```

### If you want local network only (no ngrok):
Edit `.env`:
```
USE_NGROK=False
HOST=0.0.0.0
```

## Next Steps

Once the server is running:
1. Note the ngrok public URL from the console
2. Test with: `curl https://your-ngrok-url.ngrok.io/health`
3. Use `/detect` endpoint to analyze images
4. Share the public URL with others to access your API

## Support

For issues, check:
- Python version: `python --version` (3.10-3.13 recommended)
- Installed packages: `python -m pip list`
- Server logs in the terminal

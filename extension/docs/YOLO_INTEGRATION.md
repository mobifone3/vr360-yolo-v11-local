# VR 360 Object Detector - YOLOv12 Integration

## Updates in v1.2

### ✨ New Feature: YOLOv12 Local API Integration

The extension now supports your local YOLOv12 API server!

### What's New:
- **YOLOv12 API** - Connect to your local Python server
- **Ngrok Support** - Use your ngrok public URL for remote access
- **Fast Detection** - Real-time object detection with YOLO
- **No API Costs** - Run completely locally on your machine

## How to Use

### 1. Start Your YOLO Server

Make sure your Python server is running:

```bash
cd vr-360-yolo-v12
python app.py
```

You should see:
```
🌐 Ngrok tunnel established!
📡 Public URL: https://your-url.ngrok-free.dev
🚀 Starting YOLOv12 Object Detection API Server
Local URL: http://127.0.0.1:5000
```

### 2. Install/Update the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Or click "Reload" if already installed

### 3. Use the Extension

1. Open any VR 360 tour website
2. Click the extension icon
3. Select "YOLOv12 API (Your Local Server)" from dropdown
4. Enter API URL:
   - **Local**: `http://127.0.0.1:5000` (or leave empty)
   - **Remote**: Your ngrok URL (e.g., `https://your-url.ngrok-free.dev`)
5. Click "Detect Objects"

### Detection Methods Available:

1. **YOLOv12 API** ⚡ (NEW!)
   - Your local Python server
   - Fast, accurate, free
   - Works with ngrok for remote access
   - No API costs

2. **Roboflow API**
   - Cloud-based detection
   - Good for custom models
   - Free tier: 1000 calls/month

3. **Google Vision API**
   - Google Cloud service
   - Very accurate
   - Paid service

4. **TensorFlow.js**
   - Browser-based
   - May not work on all sites due to CSP

## Configuration

### Local Server (Default)
Leave the URL field empty or enter:
```
http://127.0.0.1:5000
```

### Remote Access (Ngrok)
Use your ngrok URL:
```
https://eponymous-probankruptcy-josiah.ngrok-free.dev
```

### Using Different Ngrok URL
Your ngrok URL changes each time you restart. The extension will save it automatically.

## Troubleshooting

### "Cannot connect to YOLO API"
- Make sure Python server is running: `python app.py`
- Check the URL is correct
- For ngrok: Make sure the tunnel is active

### "CORS Error"
- The extension should handle CORS automatically
- If issues persist, check browser console (F12)

### Extension Not Detecting
1. Refresh the page after installing extension
2. Make sure content script loaded (check console)
3. Try local URL first: `http://127.0.0.1:5000`

## Features

✅ Automatic bounding box visualization
✅ Object labels and confidence scores
✅ Support for 80 COCO object classes
✅ Adjustable confidence threshold
✅ Works on any website
✅ Local and remote API support

## Next Steps

- Adjust confidence threshold in `.env` file
- Try different YOLO models (yolov8s, yolov8m, etc.)
- Train custom models for specific objects
- Use the API from other applications

## API Server Info

Server is running at:
- **Local**: http://127.0.0.1:5000
- **Public**: https://eponymous-probankruptcy-josiah.ngrok-free.dev

Endpoints:
- `/health` - Health check
- `/detect` - Object detection (POST with image)
- `/classes` - List detectable objects
- `/` - API documentation

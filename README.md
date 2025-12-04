# YOLOv12 Object Detection API Server

A lightweight Flask-based API server for serving YOLOv12 (YOLOv8) model for object detection. The server accepts images via HTTP requests and returns JSON with detected objects.

## Features

- 🚀 Lightweight Flask server
- 🔍 Object detection with YOLOv8/v12
- 🌐 Network accessible (Tailscale ready - 0.0.0.0)
- 📤 Multiple input methods (file upload, URL)
- ⚙️ Configurable confidence threshold
- 📊 JSON response format
- 🏥 Health check endpoint

## Requirements

- Python 3.8 or higher
- See `requirements.txt` for dependencies

## Installation

1. **Clone or navigate to the project directory**

```bash
cd vr-360-yolo-v12
```

2. **Create a virtual environment (recommended)**

```bash
python -m venv venv
```

3. **Activate the virtual environment**

Windows (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

Windows (CMD):

```cmd
venv\Scripts\activate.bat
```

Linux/Mac:

```bash
source venv/bin/activate
```

4. **Install dependencies**

```bash
pip install -r requirements.txt
```

## Usage

### Start the Server

Basic usage (default settings):

```bash
python app.py
```

The server will start on `0.0.0.0:5000` and automatically download the YOLOv8n model on first run.

### Environment Variables

You can customize the server using environment variables:

```bash
# Model path (default: yolov8n.pt)
# Options: yolov8n.pt (nano), yolov8s.pt (small), yolov8m.pt (medium),
#          yolov8l.pt (large), yolov8x.pt (xlarge)
$env:YOLO_MODEL_PATH="yolov8s.pt"

# Confidence threshold (default: 0.25)
$env:CONFIDENCE_THRESHOLD="0.3"

# Server host (default: 0.0.0.0)
$env:HOST="0.0.0.0"

# Server port (default: 5000)
$env:PORT="5000"

# Debug mode (default: False)
$env:DEBUG="True"

# Run the server
python app.py
```

### Using Your Own Model

If you have a custom trained YOLOv8 model:

```bash
$env:YOLO_MODEL_PATH="path/to/your/model.pt"
python app.py
```

## API Endpoints

### 1. Health Check

```http
GET /health
```

Response:

```json
{
  "status": "healthy",
  "model": "yolov8n.pt",
  "confidence_threshold": 0.25
}
```

### 2. Object Detection (File Upload)

```http
POST /detect
Content-Type: multipart/form-data
```

Parameters:

- `image`: Image file (required)
- `confidence`: Confidence threshold (optional, query parameter)

Example using curl:

```bash
curl -X POST http://0.0.0.0:5000/detect \
  -F "image=@path/to/image.jpg" \
  -G -d "confidence=0.3"
```

Response:

```json
{
  "success": true,
  "image_size": {
    "width": 1920,
    "height": 1080
  },
  "detections_count": 3,
  "detections": [
    {
      "class": "person",
      "class_id": 0,
      "confidence": 0.9234,
      "bbox": {
        "x1": 100.5,
        "y1": 200.3,
        "x2": 300.2,
        "y2": 500.8,
        "width": 199.7,
        "height": 300.5
      }
    }
  ],
  "confidence_threshold": 0.3
}
```

### 3. Object Detection (URL)

```http
POST /detect/url
Content-Type: application/json
```

Body:

```json
{
  "url": "https://example.com/image.jpg",
  "confidence": 0.3
}
```

### 4. Get Classes

```http
GET /classes
```

Returns list of all classes the model can detect.

### 5. API Documentation

```http
GET /
```

Returns API documentation in JSON format.

## Testing the API

### Using PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "http://0.0.0.0:5000/health"

# Detect objects in an image
$image = [System.IO.File]::ReadAllBytes("C:\path\to\image.jpg")
$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"image.jpg`"",
    "Content-Type: image/jpeg",
    "",
    [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($image),
    "--$boundary--"
) -join "`r`n"

Invoke-RestMethod -Uri "http://0.0.0.0:5000/detect?confidence=0.3" `
    -Method Post `
    -ContentType "multipart/form-data; boundary=$boundary" `
    -Body $bodyLines
```

### Using Python Client

See `test_client.py` for a complete example.

```bash
python test_client.py path/to/image.jpg
```

## Accessing Over Network (Tailscale)

The server is configured to listen on `0.0.0.0:5000`, making it accessible over your network.

1. **Find your Tailscale IP:**

   ```bash
   tailscale ip
   ```

2. **Access from other devices:**
   ```
   http://<your-tailscale-ip>:5000/detect
   ```

## Model Information

By default, the server uses YOLOv8n (nano), which is the smallest and fastest model. You can choose different sizes based on your needs:

| Model      | Size   | Speed   | Accuracy  |
| ---------- | ------ | ------- | --------- |
| yolov8n.pt | ~6MB   | Fastest | Good      |
| yolov8s.pt | ~22MB  | Fast    | Better    |
| yolov8m.pt | ~52MB  | Medium  | Great     |
| yolov8l.pt | ~87MB  | Slow    | Excellent |
| yolov8x.pt | ~136MB | Slowest | Best      |

## Troubleshooting

### Port already in use

```bash
$env:PORT="8080"
python app.py
```

### Model download issues

The model will automatically download on first run. If you have issues, manually download:

```bash
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### CUDA/GPU support

If you have a NVIDIA GPU and want to use it:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Performance Tips

1. Use smaller models (yolov8n, yolov8s) for faster inference
2. Increase confidence threshold to reduce false positives
3. Enable GPU support for faster processing
4. Use `threaded=True` in Flask (already configured)

---

# VR 360 Object Detector Extension

This Chrome extension captures the current view, sends it to Google Cloud Vision API for object detection, and highlights the detected objects. It also provides a scaffold for automating polygon creation.

## Installation

1.  Open Chrome and go to `chrome://extensions/`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `extension` folder inside this project (`vr-360-auto-polygon/extension`).

## Setup API Keys

### Option 1: Roboflow API (Recommended - Better Detection) ⭐

1.  Go to [Roboflow](https://roboflow.com/) and create a free account.
2.  Navigate to [API Settings](https://app.roboflow.com/settings/api).
3.  Copy your **API Key**.
4.  (Optional) You can use the default COCO model or train your own custom model for specific objects.

**Free Tier:** 1,000 API calls/month

### Option 2: Google Cloud Vision API

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Enable the **Cloud Vision API**.
4.  Go to **Credentials** and create an **API Key**.
5.  (Optional but recommended) Restrict the API key to only use the Cloud Vision API.

**Note:** Google Vision API has limited object detection capabilities for specialized items.

## Usage

1.  Navigate to your VR 360 editor web app.
2.  Position the view where you want to detect objects.
3.  Click the extension icon in the Chrome toolbar.
4.  Select your preferred **Detection Method**:
    - **Roboflow API** - Best for diverse objects (decorative items, products, etc.)
    - **Google Vision API** - Good for common objects (furniture, people, vehicles)
    - **TensorFlow.js** - Browser-based but may not work due to CSP restrictions
5.  Paste your **API Key** into the input field.
6.  Click **Detect Objects & Create Polygons**.
7.  The extension will capture the screen, call the API, and draw colored bounding boxes around detected objects.

### API Key Formats

**Roboflow:**

- **PRIVATE API key** (not Publishable): `abc123def456`
- Get from: https://app.roboflow.com/settings/api → "Private API Key" section
- Or full format: `workspace/model/version?api_key=YOUR_KEY`
- Default uses Microsoft COCO model (80 common objects)

**Google Vision:**

- Just the API key: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## Limitations & Solutions

### Why aren't all objects detected?

**COCO Model (Default) detects only 80 common objects:**

- ✅ People, chairs, tables, bottles, vases, potted plants, furniture
- ❌ Picture frames, decorative items, specialized products, wall art

### Solutions for Better Detection:

#### 1. **Train a Custom Roboflow Model** (Best for your specific objects)

- Upload 50-100 images of your scene with similar objects
- Annotate the objects you want to detect (e.g., "picture frame", "wall art")
- Train a custom model in Roboflow
- Use your custom model: `your-workspace/custom-model/1?api_key=YOUR_KEY`

#### 2. **Lower the Confidence Threshold**

Currently set to 40% in `content.js`. Edit line ~248:

```javascript
const confidenceThreshold = 0.25; // Lower from 0.4 to 0.25
```

#### 3. **Try Other Pre-trained Models**

Browse Roboflow Universe for specialized models:

- https://universe.roboflow.com/
- Search for "furniture", "retail", "indoor objects", etc.
- Use format: `workspace/model/version?api_key=YOUR_KEY`

#### 4. **Use AWS Rekognition Custom Labels**

- Better for specialized objects
- Requires custom training but very accurate

## Project Structure

```
extension/
├── api/
│   ├── roboflow.js          # Roboflow API detection module
│   ├── google-vision.js     # Google Cloud Vision API module
│   ├── aws-rekognition.js   # AWS Rekognition module (placeholder)
│   └── tensorflow.js        # TensorFlow.js module (CSP-limited)
├── content.js               # Main content script & UI
├── popup.html               # Extension popup UI
├── popup.js                 # Popup logic
└── manifest.json            # Extension manifest
```

## Customization for Automation

The file `content.js` contains a function `automatePolygonCreation`. This function is currently a placeholder. To fully automate the polygon creation in your specific web app:

1.  Open `content.js`.
2.  Locate the `automatePolygonCreation` function.
3.  You need to write JavaScript code that interacts with your specific web app's UI.
4.  - Find the button ID or class for the "Polygon" tool and simulate a click.
    - Calculate the screen coordinates for the polygon vertices.
    - Dispatch `click` or `mousedown`/`mouseup` events to the canvas element at those coordinates.

Example snippet for clicking a canvas:

```javascript
const canvas = document.querySelector("canvas"); // Adjust selector
const event = new MouseEvent("click", {
  bubbles: true,
  clientX: 100, // X coordinate
  clientY: 200, // Y coordinate
});
canvas.dispatchEvent(event);
```

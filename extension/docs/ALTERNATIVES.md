# Better APIs for Detecting Objects in Complex Scenes

## Problem
Google Cloud Vision API's `OBJECT_LOCALIZATION` **cannot detect** decorative items, jars, plants, or specialized objects. It only works for ~100 common objects (furniture, people, vehicles, etc.).

Your scene shows this limitation - 15 labels detected ✅ but 0 objects with bounding boxes ❌

---

## ✅ RECOMMENDED SOLUTIONS

### 1. **TensorFlow.js + COCO-SSD Model** (FREE, runs in browser)
- Detects 80 common objects
- Runs locally (no API needed)
- Works in real-time

**Setup:**
```html
<!-- Add to your HTML -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"></script>
```

```javascript
// In content.js
async function detectWithTensorFlow() {
  const model = await cocoSsd.load();
  const img = document.querySelector('canvas') || document.createElement('img');
  const predictions = await model.detect(img);
  
  predictions.forEach(prediction => {
    // prediction.bbox = [x, y, width, height]
    // prediction.class = "bottle", "vase", "potted plant", etc.
    // prediction.score = confidence
  });
}
```

### 2. **Roboflow Inference API** (Better than Google Vision)
- Pre-trained on more object types
- Free tier: 1,000 API calls/month
- Better for retail/product detection

**API Example:**
```javascript
const response = await fetch('https://detect.roboflow.com/your-model/version?api_key=YOUR_KEY', {
  method: 'POST',
  body: base64Image
});
```

Sign up: https://roboflow.com/

### 3. **OpenCV.js** (Contour Detection - FREE)
- Detect objects by shape/color
- No training needed
- Perfect for isolated objects on clean backgrounds

**Setup:**
```html
<script src="https://docs.opencv.org/4.x/opencv.js"></script>
```

```javascript
// Detect objects by contours
const src = cv.imread(imgElement);
const dst = new cv.Mat();
cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
cv.threshold(dst, dst, 120, 255, cv.THRESH_BINARY);
const contours = new cv.MatVector();
cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
```

### 4. **Ultralytics YOLOv8 via Replicate** (Most Accurate)
- State-of-the-art object detection
- Detects 80+ object classes
- API-based, pay-per-use

**API Example:**
```javascript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: "yolov8-version-id",
    input: { image: base64Image }
  })
});
```

Website: https://replicate.com/ultralytics/yolov8

### 5. **AWS Rekognition** (Alternative to Google)
- DetectLabels + DetectCustomLabels
- Better for diverse objects
- Free tier: 5,000 images/month

---

## 🎯 MY RECOMMENDATION FOR YOUR USE CASE

Since you have:
- Many small decorative objects
- Interior/museum-like scenes
- Need for automatic polygon detection

**Best approach: TensorFlow.js COCO-SSD + OpenCV.js**

1. Use COCO-SSD to detect recognized objects (bottles, vases, plants)
2. Use OpenCV.js contour detection for unrecognized objects
3. Combine both results to maximize coverage

---

## Implementation Priority:

1. **Quick Win**: Add TensorFlow.js COCO-SSD (30 min setup)
2. **Better Coverage**: Add OpenCV.js contours (1-2 hours)
3. **Best Accuracy**: Integrate Roboflow or YOLOv8 (requires API key)

Would you like me to implement any of these alternatives?

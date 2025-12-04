# Troubleshooting Guide

## Problem: "No objects detected by YOLOv12"

### Symptoms
- Extension shows: "YOLO detected 0 objects"
- Console shows: `detections_count: 0`
- API returns success but empty detections array

### Common Causes & Solutions

#### 1. Canvas is Blank (WebGL Issue)
**Problem:** Canvas element exists but contains no rendered content when captured.

**Why:** WebGL contexts need `preserveDrawingBuffer: true` to be capturable.

**Solution:** Extension now automatically:
1. Detects blank canvas
2. Retries capture after delay
3. Falls back to SVG if available
4. Shows clear error message

**Check in Console:**
```
⚠️ Canvas appears blank, trying alternative method...
🔄 Trying SVG capture instead...
```

#### 2. Wrong Element Captured
**Problem:** Capturing a loading screen, thumbnail, or UI element instead of main scene.

**Solution:** Extension prioritizes:
1. SVG elements (most reliable)
2. Large elements (> 500x300 pixels)
3. Main viewer over thumbnails

**Check in Console:**
```
✓ Found scene element using selector: svg
  Element type: svg
  Dimensions: 1920x1080
```

#### 3. Scene Still Loading
**Problem:** Scene is captured before 3D models/textures load.

**Solution:** 
- Wait for scene to fully load before clicking "Detect Objects"
- Look for loading indicators to disappear
- Ensure all textures/models are visible

#### 4. Objects Not in COCO Dataset
**Problem:** Scene contains objects YOLO doesn't recognize.

**COCO Dataset includes:** People, vehicles, animals, furniture, electronics, sports equipment

**COCO Does NOT include:** Buildings, trees, pools, grass, sky, architectural elements

**Solution:** Use hybrid detection for picture frames, or other APIs for specialized objects:
- Google Vision API: Better at misc objects
- Custom YOLO training: For specific objects

#### 5. Image Too Small/Low Quality
**Problem:** Captured image is too small for detection.

**Check in Console:**
```
📦 Sending image: 5KB  ← Too small!
```

**Should be:** 50-500KB for good detection

**Solution:** 
- Ensure scene element is large enough (> 800x600)
- Check image quality isn't over-compressed
- View captured image in console to verify content

## Debugging Steps

### Step 1: Check Scene Element
```javascript
// Run in browser console
const svg = document.querySelector('svg');
const canvas = document.querySelector('canvas');

console.log('SVG:', svg, svg?.offsetWidth, svg?.offsetHeight);
console.log('Canvas:', canvas, canvas?.offsetWidth, canvas?.offsetHeight);
```

### Step 2: Test Canvas Capture
```javascript
// Run in browser console
const canvas = document.querySelector('canvas');
if (canvas) {
  const dataUrl = canvas.toDataURL('image/jpeg');
  console.log('Canvas data URL length:', dataUrl.length);
  
  // View the captured image
  const img = new Image();
  img.src = dataUrl;
  document.body.appendChild(img);
}
```

### Step 3: Test SVG Capture
```javascript
// Run in browser console
const svg = document.querySelector('svg');
if (svg) {
  const bbox = svg.getBoundingClientRect();
  console.log('SVG dimensions:', bbox.width, 'x', bbox.height);
  
  const svgString = new XMLSerializer().serializeToString(svg);
  console.log('SVG content length:', svgString.length);
}
```

### Step 4: Check API Response
```javascript
// Check extension console (Inspect Popup)
// Look for:
YOLO Hybrid API Response: {
  success: true,
  detections_count: 0,  // ← Problem here
  image_size: { width: 855, height: 794 },
  detections: []
}
```

### Step 5: Verify Image Content
```javascript
// Add this temporarily to yolo.js after line 50
console.log('Captured image preview:', base64Image.substring(0, 100));

// Open the image in new tab to verify content
const img = new Image();
img.src = 'data:image/jpeg;base64,' + base64Image;
document.body.appendChild(img);
```

## Quick Fixes

### Fix 1: Force SVG Capture
Edit `content.js` line 45, move SVG to top priority:
```javascript
const selectors = [
  'svg',  // ← Keep this first
  // ... rest
];
```

### Fix 2: Increase Capture Delay
Edit `content.js` line 180:
```javascript
// Change from 100ms to 500ms
await new Promise(resolve => setTimeout(resolve, 500));
```

### Fix 3: Lower YOLO Confidence
Edit API request in `yolo.js`:
```javascript
// Add confidence parameter
const response = await fetch(apiUrl + '?confidence=0.1', {
  method: 'POST',
  body: formData
});
```

### Fix 4: Use Different Endpoint
Try standard YOLO (without OpenCV):
```javascript
// In popup.js, change URL
apiUrl = apiUrl.replace('/detect/hybrid', '/detect');
```

## Console Messages Explained

### ✅ Good Messages
```
✓ Found scene element using selector: svg
✅ Scene captured successfully
📦 Sending image: 150KB
✅ YOLOv12 detected 20 objects!
```

### ⚠️ Warning Messages
```
⚠️ Canvas appears blank, trying alternative method...
⚠️ Could not find VR-360 scene element
💡 TIP: Check SCENE_CAPTURE.md
```

### ❌ Error Messages
```
❌ Canvas is blank even after retry
❌ Scene capture failed: Error...
❌ No objects detected by YOLOv12
```

## Still Not Working?

### Last Resort Options

1. **Use Manual Image Upload**
   - Take screenshot manually (Print Screen)
   - Save image file
   - Test with `test_hybrid.py your_screenshot.jpg`

2. **Try Different API**
   - Switch to Google Vision API
   - Use Roboflow API
   - These may detect different object types

3. **Check Your Scene**
   - Does it contain COCO objects?
   - Is the scene actually rendered?
   - Try a simpler test scene first

4. **Verify Server**
   ```bash
   # Test server directly
   curl -X POST http://localhost:5000/detect/hybrid \
     -F "image=@test.jpg"
   ```

## Getting Help

When reporting issues, include:

1. **Console output** (all messages from extension)
2. **Scene element info** (SVG/canvas dimensions)
3. **Image size** (KB from "Sending image: XXkB")
4. **API response** (from console)
5. **Screenshot** of the scene you're trying to detect

## Common Scenarios

### Scenario 1: VR-360 Interior Scene
**Objects:** Furniture, doors, windows, lights
**Expected:** Chairs, couches, tables, tvs (if in scene)
**Not Expected:** Walls, ceiling, floor, architectural elements

### Scenario 2: VR-360 Exterior Scene  
**Objects:** Buildings, trees, roads, sky
**Expected:** Cars, people, bicycles (if in scene)
**Not Expected:** Buildings, trees, sky, grass

### Scenario 3: Art Gallery with Picture Frames
**Objects:** Wall frames, chairs, tables
**Expected (Hybrid):** Picture frames (OpenCV), chairs (YOLO)
**Expected (Standard):** Chairs only (YOLO)

## Prevention Tips

1. **Always check console** before reporting issues
2. **Wait for scene to load** completely
3. **Use SVG when possible** (more reliable than canvas)
4. **Test with known objects** first (put a chair in view)
5. **Check image preview** to verify capture worked
6. **Reload extension** after code changes
7. **Refresh page** after extension reload

---

**Most Common Fix:** The canvas is blank because it's WebGL. Solution: Extension now automatically tries SVG instead. Make sure your scene has an SVG element!

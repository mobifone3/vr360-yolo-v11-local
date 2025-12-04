# Quick Start Guide - Interactive Bounding Boxes

## 🚀 How to Use

### Step 1: Reload the Extension
After updating the code, reload your extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension
3. Reload the webpage where you want to detect objects

### Step 2: Run Detection
- Open the extension popup
- Choose your detection method (YOLOv12 recommended)
- Click "Detect Objects"

### Step 3: Interact with Bounding Boxes

#### ✋ **Moving Boxes**
```
1. Hover over any bounding box
2. Click and hold anywhere on the box
3. Drag to new position
4. Release to drop
```

#### 📏 **Resizing Boxes**
```
Corner Handles (●):
- Top-left: Resize from top-left corner
- Top-right: Resize from top-right corner
- Bottom-left: Resize from bottom-left corner
- Bottom-right: Resize from bottom-right corner

Edge Handles (▬):
- Top: Resize height from top
- Bottom: Resize height from bottom
- Left: Resize width from left
- Right: Resize width from right
```

#### 📋 **Duplicating Boxes**
```
1. Hover over the box you want to duplicate
2. Click the 📋 button at the bottom
3. New box appears 30px offset
4. Drag to desired position
```

#### 🗑️ **Deleting Boxes**
```
Option 1: Click 🗑️ button at bottom
Option 2: Click ✕ in the label
```

## 🎯 Example Workflow

### Scenario: Annotating Multiple Similar Objects

1. **Detect initial objects**
   - Run YOLOv12 detection
   - Extension creates bounding boxes

2. **Adjust detected boxes**
   - Drag boxes to correct positions
   - Resize to fit objects better

3. **Add more annotations**
   - Find a box with correct size
   - Duplicate it (📋 button)
   - Drag duplicate to new object
   - Adjust size if needed

4. **Clean up**
   - Remove incorrect detections (🗑️)
   - Fine-tune all boxes

## 💡 Pro Tips

### Tip 1: Batch Duplication
- Duplicate a box multiple times
- Arrange them in a grid pattern
- Adjust each individually

### Tip 2: Size Templates
- Create boxes of standard sizes
- Keep them at screen edge
- Duplicate and drag when needed

### Tip 3: Precision Adjustment
- Zoom in on the VR scene
- Adjust boxes for pixel-perfect accuracy
- Use corner handles for fine control

### Tip 4: Color Coding
- Different colors = different detections
- Use colors to identify object types
- Duplicates maintain original color

## 🐛 Troubleshooting

### Boxes won't drag
- Make sure you're not clicking on resize handles
- Try clicking center of the box

### Handles not visible
- Hover directly over the box
- They fade in after ~0.2 seconds

### Duplicate not working
- Check browser console for errors
- Make sure box wasn't deleted

### Extension not loading changes
1. Go to `chrome://extensions/`
2. Toggle extension OFF then ON
3. Hard refresh webpage (Ctrl+Shift+R)

## 🔧 Customization

### Want different colors?
Edit `getColorForIndex()` in `ui-display.js`

### Want different handle sizes?
Edit sizes in `addResizeHandles()` function

### Want keyboard shortcuts?
Add event listeners in `makeDraggable()` function

## 📝 Notes

- All changes are visual only (not persisted)
- Refresh page to reset
- Works with all detection APIs
- No server-side changes needed

Enjoy your enhanced detection workflow! 🎉

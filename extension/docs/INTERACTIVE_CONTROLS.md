# Interactive Bounding Box Controls

## Features Added

Your VR 360 Object Detector now has full interactive control over detected bounding boxes!

### 🎯 Features

#### 1. **Move Bounding Boxes**
- Click and drag anywhere on the bounding box to move it around the canvas
- Cursor changes to indicate draggable state
- Smooth dragging experience

#### 2. **Resize Bounding Boxes**
- **8 Resize Handles**: 4 corner handles + 4 edge handles
- **Corner handles** (circles): Resize diagonally
- **Edge handles** (rectangles): Resize horizontally or vertically
- Handles appear when hovering over the bounding box
- Minimum size: 50x50 pixels

#### 3. **Duplicate Bounding Boxes**
- Click the 📋 (clipboard) button below the box
- Creates an exact copy offset by 30px
- Duplicate inherits all properties (label, score, color)
- All interactive features work on duplicates

#### 4. **Delete Bounding Boxes**
- Click the 🗑️ (trash) button below the box
- Or click the ✕ button in the label
- Instantly removes the bounding box

### 🎨 Visual Design

- **Hover effects**: Boxes glow when hovered
- **Control buttons**: Only appear on hover to reduce clutter
- **Resize handles**: Fade in on hover with scale animation
- **Color-coded**: Each box and its controls match the detection color
- **Smooth animations**: All interactions have smooth transitions

### 🖱️ Usage

1. **Run object detection** as usual (YOLOv12, Roboflow, etc.)
2. **Hover over any detection box** to see controls
3. **Drag** the box to reposition
4. **Grab resize handles** to adjust size
5. **Click duplicate** to create copies
6. **Click delete** to remove boxes

### 💡 Use Cases

- **Manual adjustment**: Fine-tune detection results
- **Template creation**: Duplicate boxes for similar objects
- **Coverage testing**: Move boxes to test different areas
- **Training data**: Adjust boxes for better model training
- **Custom annotations**: Add boxes manually by duplicating

### ⚙️ Technical Details

- All bounding boxes are now interactive (pointer-events enabled)
- Drag system uses mouse events with proper event handling
- Resize system supports 8-directional resizing
- State preservation on duplication
- No conflicts with existing detection workflow

### 🔧 Keyboard Shortcuts (Future Enhancement)

Consider adding:
- `Ctrl+D`: Duplicate selected box
- `Delete`: Remove selected box
- `Arrow keys`: Fine-tune position
- `Shift+Arrows`: Resize by 1px

Enjoy your enhanced object detection workflow! 🚀

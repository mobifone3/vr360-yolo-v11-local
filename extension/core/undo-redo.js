/**
 * Undo/Redo Module
 * Handles state management for undo/redo operations
 *
 * Dependencies:
 * - core/bbox-drag.js (makeDraggable)
 */

// Global undo/redo stacks
let undoStack = [];
let redoStack = [];

/**
 * Save current state for undo
 * Call this after any modification to bounding boxes
 */
function saveStateForUndo() {
  const boxes = Array.from(document.querySelectorAll(".vr-auto-polygon-box"));
  const state = boxes.map((box) => ({
    html: box.outerHTML,
    dataset: { ...box.dataset },
  }));

  undoStack.push(state);
  redoStack = []; // Clear redo stack when new action is performed
  console.log(`💾 State saved for undo (stack size: ${undoStack.length})`);
}

/**
 * Perform undo action
 * Restores the previous state of bounding boxes
 */
function performUndo() {
  if (undoStack.length === 0) {
    console.log("↩️ Nothing to undo");
    return;
  }

  // Save current state to redo stack
  const boxes = Array.from(document.querySelectorAll(".vr-auto-polygon-box"));
  const currentState = boxes.map((box) => ({
    html: box.outerHTML,
    dataset: { ...box.dataset },
  }));
  redoStack.push(currentState);

  // Restore previous state
  const previousState = undoStack.pop();

  // Clear all current boxes
  boxes.forEach((box) => box.remove());

  // Restore previous boxes
  previousState.forEach((boxData) => {
    const temp = document.createElement("div");
    temp.innerHTML = boxData.html;
    const box = temp.firstChild;

    // Restore dataset
    Object.keys(boxData.dataset).forEach((key) => {
      box.dataset[key] = boxData.dataset[key];
    });

    // Re-attach event listeners
    if (typeof makeDraggable === "function") {
      makeDraggable(box);
    }

    document.body.appendChild(box);
  });

  // Update the list panel if available
  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }

  console.log(`↩️ Undo performed (undo stack: ${undoStack.length}, redo stack: ${redoStack.length})`);
}

/**
 * Perform redo action
 * Restores the next state of bounding boxes
 */
function performRedo() {
  if (redoStack.length === 0) {
    console.log("↪️ Nothing to redo");
    return;
  }

  // Save current state to undo stack
  const boxes = Array.from(document.querySelectorAll(".vr-auto-polygon-box"));
  const currentState = boxes.map((box) => ({
    html: box.outerHTML,
    dataset: { ...box.dataset },
  }));
  undoStack.push(currentState);

  // Restore next state
  const nextState = redoStack.pop();

  // Clear all current boxes
  boxes.forEach((box) => box.remove());

  // Restore next boxes
  nextState.forEach((boxData) => {
    const temp = document.createElement("div");
    temp.innerHTML = boxData.html;
    const box = temp.firstChild;

    // Restore dataset
    Object.keys(boxData.dataset).forEach((key) => {
      box.dataset[key] = boxData.dataset[key];
    });

    // Re-attach event listeners
    if (typeof makeDraggable === "function") {
      makeDraggable(box);
    }

    document.body.appendChild(box);
  });

  // Update the list panel if available
  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }

  console.log(`↪️ Redo performed (undo stack: ${undoStack.length}, redo stack: ${redoStack.length})`);
}

/**
 * Clear undo/redo stacks
 * Call this when starting fresh or on major changes
 */
function clearUndoRedoStacks() {
  undoStack = [];
  redoStack = [];
  console.log("🧹 Undo/redo stacks cleared");
}

/**
 * Get current stack sizes (for debugging)
 * @returns {object} - {undoSize, redoSize}
 */
function getUndoRedoStackSizes() {
  return {
    undoSize: undoStack.length,
    redoSize: redoStack.length,
  };
}

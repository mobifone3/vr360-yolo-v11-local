/**
 * Bounding Box List Panel - Index
 *
 * This is the main entry point that loads all modules in the correct order.
 * The modules are designed to work in a browser environment where they
 * export their functions to the window object.
 *
 * Module Load Order (important for dependencies):
 * 1. constants.js    - No dependencies
 * 2. styles.js       - No dependencies
 * 3. draggable.js    - No dependencies
 * 4. highlighting.js - Depends on constants (TYPE_COLORS)
 * 5. card-actions.js - Depends on highlighting, styles
 * 6. bulk-actions.js - Depends on constants, card-actions
 * 7. card-ui.js      - Depends on constants, highlighting, card-actions, bulk-actions
 * 8. panel-ui.js     - Depends on all above modules
 *
 * Exported Functions (available on window object):
 *
 * From constants.js:
 *   - POLYGON_TYPES
 *   - TYPE_ICONS
 *   - TYPE_COLORS
 *
 * From styles.js:
 *   - BBoxListStyles (object with style helper functions)
 *
 * From draggable.js:
 *   - makeModernPanelDraggable(panel, handle)
 *
 * From highlighting.js:
 *   - highlightBoundingBox(container, highlight)
 *   - highlightCardForContainer(container)
 *   - updateCardSelection(card)
 *
 * From card-actions.js:
 *   - confirmTypeChange(container, card, newType)
 *   - deletePolygonCard(container, card)
 *   - duplicateBoundingBox(container)
 *   - editCardLabel(labelSpan, container)
 *
 * From bulk-actions.js:
 *   - updateBulkActionsVisibility()
 *   - getSelectedContainers()
 *   - bulkChangeType(newType)
 *   - bulkDeleteSelected()
 *   - createBulkActionsBar(onSelectAllChange)
 *
 * From card-ui.js:
 *   - createPolygonCard(container, index)
 *
 * From panel-ui.js:
 *   - createPanelHeader(onClose)
 *   - createListContainer()
 *   - createModernBoundingBoxListPanel()
 *   - updateModernBoundingBoxList()
 *   - toggleModernBoundingBoxPanel()
 *
 * Usage in manifest.json content_scripts:
 * Add these files in order:
 *   "js": [
 *     "core/bbox-list/constants.js",
 *     "core/bbox-list/styles.js",
 *     "core/bbox-list/draggable.js",
 *     "core/bbox-list/highlighting.js",
 *     "core/bbox-list/card-actions.js",
 *     "core/bbox-list/bulk-actions.js",
 *     "core/bbox-list/card-ui.js",
 *     "core/bbox-list/panel-ui.js"
 *   ]
 *
 * Or for a single file approach, keep using bbox-list-panel.js which
 * now serves as a compatibility wrapper.
 */

// This file serves as documentation and can be used for ES6 module bundling
// if the project migrates to a build system in the future.

console.log("📦 BBox List Panel modules loaded");

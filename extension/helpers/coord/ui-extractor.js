/**
 * UI Value Extractor
 * Extracts krpano view parameters from the editor UI
 */

/**
 * Safely parse a numeric value from an input element
 * @param {HTMLInputElement} input - Input element
 * @returns {number|null} - Parsed value or null
 */
function parseInputValue(input) {
  if (!input) return null;
  let val = parseFloat(input.value);
  if (isNaN(val)) val = parseFloat(input.getAttribute("value"));
  return isNaN(val) ? null : val;
}

/**
 * Extract hlookat and vlookat from UI
 * @returns {object} - {hlookat, vlookat}
 */
function extractLookatFromUI() {
  let hlookat = null;
  let vlookat = null;

  // Strategy 1: Find by ant-input-prefix class
  const prefixes = Array.from(document.querySelectorAll(".ant-input-prefix"));
  prefixes.forEach((prefix) => {
    const text = prefix.textContent.trim().toLowerCase();
    if (text === "hlookat" || text === "vlookat") {
      let input = prefix.nextElementSibling;
      if (input && input.tagName === "INPUT") {
        const val = parseInputValue(input);
        if (val !== null) {
          if (text === "hlookat") hlookat = val;
          if (text === "vlookat") vlookat = val;
        }
      }
    }
  });

  // Strategy 2: Fallback - search by span text
  if (hlookat === null || vlookat === null) {
    const spans = Array.from(document.querySelectorAll("span"));
    spans.forEach((span) => {
      const text = span.textContent.trim().toLowerCase();
      if (text === "hlookat" && hlookat === null) {
        let input = span.nextElementSibling;
        if (input && input.tagName === "INPUT") hlookat = parseInputValue(input);
      }
      if (text === "vlookat" && vlookat === null) {
        let input = span.nextElementSibling;
        if (input && input.tagName === "INPUT") vlookat = parseInputValue(input);
      }
    });
  }

  return { hlookat, vlookat };
}

/**
 * Extract FOV from UI (labeled as "Zoom" in this UI)
 * @returns {number|null} - FOV in degrees
 */
function extractFovFromUI() {
  let fov = null;

  const labels = Array.from(document.querySelectorAll(".label"));
  labels.forEach((label) => {
    const labelText = label.textContent.trim();

    if (labelText === "FOV" || labelText === "fov" || labelText === "Zoom" || labelText === "zoom") {
      const container = label.parentElement;
      if (container) {
        const input = container.querySelector("input");
        if (input) {
          const val = parseInputValue(input);
          if (val !== null && val > 0) {
            fov = val;
          }
        }
      }
    }
  });

  return fov;
}

/**
 * Get complete krpano view parameters from UI
 * @returns {object|null} - {hlookat, vlookat, fov} or null
 */
function getKrpanoViewFromUI() {
  try {
    const { hlookat, vlookat } = extractLookatFromUI();
    const fov = extractFovFromUI();

    if (hlookat !== null || vlookat !== null || fov !== null) {
      return {
        hlookat: hlookat !== null ? hlookat : 0,
        vlookat: vlookat !== null ? vlookat : 0,
        fov: fov !== null ? Math.max(5, Math.min(179, fov)) : 90,
      };
    }
  } catch (e) {
    console.warn("Error reading krpano view from UI:", e);
  }
  return null;
}

/**
 * Save current view state to localStorage before reload
 * This preserves zoom, hlookat, and vlookat values
 */
function saveViewStateBeforeReload() {
  try {
    const viewState = getKrpanoViewFromUI();
    if (viewState) {
      const stateWithTimestamp = {
        ...viewState,
        timestamp: Date.now(),
        url: window.location.href,
      };
      localStorage.setItem("vr360-extension-view-state", JSON.stringify(stateWithTimestamp));
      console.log("💾 Saved view state before reload:", viewState);
      return true;
    }
  } catch (e) {
    console.warn("Failed to save view state:", e);
  }
  return false;
}

/**
 * Restore view state from localStorage after reload
 * Sets the values back to the UI inputs
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 10 seconds)
 */
function restoreViewStateAfterReload(maxAgeMs = 10000) {
  try {
    const savedState = localStorage.getItem("vr360-extension-view-state");
    if (!savedState) {
      console.log("No saved view state found");
      return false;
    }

    const state = JSON.parse(savedState);

    // Check if state is recent and from the same URL
    const age = Date.now() - (state.timestamp || 0);
    if (age > maxAgeMs) {
      console.log("Saved view state is too old, ignoring");
      localStorage.removeItem("vr360-extension-view-state");
      return false;
    }

    console.log("🔄 Found saved view state:", state);

    let restored = false;

    // Restore hlookat with delay
    if (state.hlookat !== null && state.hlookat !== undefined) {
      const hlookatInput = findInputByPrefix("hlookat");
      if (hlookatInput) {
        setTimeout(() => {
          setInputValue(hlookatInput, state.hlookat);
          console.log(`✓ Restored hlookat: ${state.hlookat}`);
        }, 100);
        restored = true;
      } else {
        console.warn("⚠️ Could not find hlookat input");
      }
    }

    // Restore vlookat with slight delay
    if (state.vlookat !== null && state.vlookat !== undefined) {
      const vlookatInput = findInputByPrefix("vlookat");
      if (vlookatInput) {
        setTimeout(() => {
          setInputValue(vlookatInput, state.vlookat);
          console.log(`✓ Restored vlookat: ${state.vlookat}`);
        }, 200);
        restored = true;
      } else {
        console.warn("⚠️ Could not find vlookat input");
      }
    }

    // Restore FOV/Zoom with delay
    if (state.fov !== null && state.fov !== undefined) {
      const fovInput = findInputByLabel("Zoom") || findInputByLabel("FOV");
      if (fovInput) {
        setTimeout(() => {
          setInputValue(fovInput, state.fov);
          console.log(`✓ Restored zoom/fov: ${state.fov}`);
        }, 300);
        restored = true;
      } else {
        console.warn("⚠️ Could not find zoom/fov input");
      }
    }

    if (restored) {
      console.log("🔄 View state restoration initiated");

      // Clear the saved state after restoration
      setTimeout(() => {
        localStorage.removeItem("vr360-extension-view-state");
        console.log("✅ View state cleared from storage");
      }, 1000);

      return true;
    }

    console.log("⚠️ No inputs found to restore");
    return false;
  } catch (e) {
    console.warn("Failed to restore view state:", e);
    localStorage.removeItem("vr360-extension-view-state");
  }
  return false;
}

/**
 * Find input element by its prefix text
 * @param {string} prefixText - The prefix text to search for
 * @returns {HTMLInputElement|null}
 */
function findInputByPrefix(prefixText) {
  // Strategy 1: Look for .ant-input-prefix with the text
  const prefixes = Array.from(document.querySelectorAll(".ant-input-prefix"));
  for (const prefix of prefixes) {
    if (prefix.textContent.trim().toLowerCase() === prefixText.toLowerCase()) {
      const input = prefix.nextElementSibling;
      if (input && input.tagName === "INPUT") {
        console.log(`✓ Found ${prefixText} input via .ant-input-prefix`);
        return input;
      }
    }
  }

  // Strategy 2: Look for inputs with placeholder or adjacent text
  const allInputs = Array.from(document.querySelectorAll("input[type='text']"));
  for (const input of allInputs) {
    // Check if the input's wrapper has the prefix text
    const wrapper = input.closest(".ant-input-affix-wrapper");
    if (wrapper) {
      const wrapperText = wrapper.textContent.toLowerCase();
      if (wrapperText.includes(prefixText.toLowerCase())) {
        console.log(`✓ Found ${prefixText} input via wrapper text`);
        return input;
      }
    }
  }

  // Strategy 3: Look for span with the text followed by an input
  const allSpans = Array.from(document.querySelectorAll("span"));
  for (const span of allSpans) {
    if (span.textContent.trim().toLowerCase() === prefixText.toLowerCase()) {
      // Try next sibling
      let sibling = span.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "INPUT") {
          console.log(`✓ Found ${prefixText} input via span sibling`);
          return sibling;
        }
        sibling = sibling.nextElementSibling;
      }
      // Try looking within parent
      const parentInput = span.parentElement?.querySelector("input");
      if (parentInput) {
        console.log(`✓ Found ${prefixText} input via span parent`);
        return parentInput;
      }
    }
  }

  console.warn(`⚠️ Could not find input for: ${prefixText}`);
  return null;
}

/**
 * Find input element by its associated label
 * @param {string} labelText - The label text to search for
 * @returns {HTMLInputElement|null}
 */
function findInputByLabel(labelText) {
  const labels = Array.from(document.querySelectorAll(".label"));
  for (const label of labels) {
    if (label.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
      const container = label.parentElement;
      if (container) {
        const input = container.querySelector("input");
        if (input) {
          return input;
        }
      }
    }
  }
  return null;
}

/**
 * Save current view state to localStorage before reload
 * This preserves zoom, hlookat, and vlookat values
 */
function saveViewStateBeforeReload() {
  try {
    const viewState = getKrpanoViewFromUI();
    if (viewState) {
      const stateWithTimestamp = {
        ...viewState,
        timestamp: Date.now(),
        url: window.location.href,
      };
      localStorage.setItem("vr360-extension-view-state", JSON.stringify(stateWithTimestamp));
      console.log("💾 Saved view state before reload:", viewState);
      return true;
    }
  } catch (e) {
    console.warn("Failed to save view state:", e);
  }
  return false;
}

/**
 * Restore view state from localStorage after reload
 * Sets the values back to the UI inputs
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 10 seconds)
 */
function restoreViewStateAfterReload(maxAgeMs = 10000) {
  try {
    const savedState = localStorage.getItem("vr360-extension-view-state");
    if (!savedState) {
      console.log("No saved view state found");
      return false;
    }

    const state = JSON.parse(savedState);

    // Check if state is recent and from the same URL
    const age = Date.now() - (state.timestamp || 0);
    if (age > maxAgeMs) {
      console.log("Saved view state is too old, ignoring");
      localStorage.removeItem("vr360-extension-view-state");
      return false;
    }

    console.log("🔄 Found saved view state:", state);

    let restored = false;

    // Restore hlookat with delay
    if (state.hlookat !== null && state.hlookat !== undefined) {
      const hlookatInput = findInputByPrefix("hlookat");
      if (hlookatInput) {
        setTimeout(() => {
          setInputValue(hlookatInput, state.hlookat);
          console.log(`✓ Restored hlookat: ${state.hlookat}`);
        }, 100);
        restored = true;
      } else {
        console.warn("⚠️ Could not find hlookat input");
      }
    }

    // Restore vlookat with slight delay
    if (state.vlookat !== null && state.vlookat !== undefined) {
      const vlookatInput = findInputByPrefix("vlookat");
      if (vlookatInput) {
        setTimeout(() => {
          setInputValue(vlookatInput, state.vlookat);
          console.log(`✓ Restored vlookat: ${state.vlookat}`);
        }, 200);
        restored = true;
      } else {
        console.warn("⚠️ Could not find vlookat input");
      }
    }

    // Restore FOV/Zoom with delay
    if (state.fov !== null && state.fov !== undefined) {
      const fovInput = findInputByLabel("Zoom") || findInputByLabel("FOV");
      if (fovInput) {
        setTimeout(() => {
          setInputValue(fovInput, state.fov);
          console.log(`✓ Restored zoom/fov: ${state.fov}`);
        }, 300);
        restored = true;
      } else {
        console.warn("⚠️ Could not find zoom/fov input");
      }
    }

    if (restored) {
      console.log("🔄 View state restoration initiated");

      // Clear the saved state after restoration
      setTimeout(() => {
        localStorage.removeItem("vr360-extension-view-state");
        console.log("✅ View state cleared from storage");
      }, 1000);

      return true;
    }

    console.log("⚠️ No inputs found to restore");
    return false;
  } catch (e) {
    console.warn("Failed to restore view state:", e);
    localStorage.removeItem("vr360-extension-view-state");
  }
  return false;
}

/**
 * Find input element by its prefix text
 * @param {string} prefixText - The prefix text to search for
 * @returns {HTMLInputElement|null}
 */
function findInputByPrefix(prefixText) {
  // Strategy 1: Look for .ant-input-prefix with the text
  const prefixes = Array.from(document.querySelectorAll(".ant-input-prefix"));
  for (const prefix of prefixes) {
    if (prefix.textContent.trim().toLowerCase() === prefixText.toLowerCase()) {
      const input = prefix.nextElementSibling;
      if (input && input.tagName === "INPUT") {
        console.log(`✓ Found ${prefixText} input via .ant-input-prefix`);
        return input;
      }
    }
  }

  // Strategy 2: Look for inputs with placeholder or adjacent text
  const allInputs = Array.from(document.querySelectorAll("input[type='text']"));
  for (const input of allInputs) {
    // Check if the input's wrapper has the prefix text
    const wrapper = input.closest(".ant-input-affix-wrapper");
    if (wrapper) {
      const wrapperText = wrapper.textContent.toLowerCase();
      if (wrapperText.includes(prefixText.toLowerCase())) {
        console.log(`✓ Found ${prefixText} input via wrapper text`);
        return input;
      }
    }
  }

  // Strategy 3: Look for span with the text followed by an input
  const allSpans = Array.from(document.querySelectorAll("span"));
  for (const span of allSpans) {
    if (span.textContent.trim().toLowerCase() === prefixText.toLowerCase()) {
      // Try next sibling
      let sibling = span.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "INPUT") {
          console.log(`✓ Found ${prefixText} input via span sibling`);
          return sibling;
        }
        sibling = sibling.nextElementSibling;
      }
      // Try looking within parent
      const parentInput = span.parentElement?.querySelector("input");
      if (parentInput) {
        console.log(`✓ Found ${prefixText} input via span parent`);
        return parentInput;
      }
    }
  }

  console.warn(`⚠️ Could not find input for: ${prefixText}`);
  return null;
}

/**
 * Find input element by its associated label
 * @param {string} labelText - The label text to search for
 * @returns {HTMLInputElement|null}
 */
function findInputByLabel(labelText) {
  const labels = Array.from(document.querySelectorAll(".label"));
  for (const label of labels) {
    if (label.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
      const container = label.parentElement;
      if (container) {
        const input = container.querySelector("input");
        if (input) {
          return input;
        }
      }
    }
  }
  return null;
}

/**
 * Set input value and trigger change events for React inputs
 * Uses React's internal fiber structure to force state updates
 * @param {HTMLInputElement} input - The input element
 * @param {number} value - The value to set
 */
function setInputValue(input, value) {
  if (!input) return;

  try {
    const valueStr = String(value);

    // Method 1: Find React's internal props and update them
    const reactPropsKey = Object.keys(input).find(
      (key) => key.startsWith("__reactProps") || key.startsWith("__reactEventHandlers")
    );

    if (reactPropsKey) {
      const props = input[reactPropsKey];
      if (props && props.onChange) {
        console.log(`🔧 Found React props, calling onChange directly`);

        // Create a synthetic event that mimics user input
        const syntheticEvent = {
          target: input,
          currentTarget: input,
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          isTrusted: true,
          nativeEvent: new Event("input"),
          preventDefault: () => {},
          stopPropagation: () => {},
          persist: () => {},
        };

        // Set the value first
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, valueStr);

        // Call React's onChange handler
        props.onChange(syntheticEvent);

        console.log(`📝 Called React onChange for value: ${valueStr}`);
        return;
      }
    }

    // Method 2: Use React DevTools trick - find fiber and update
    const reactInternalKey = Object.keys(input).find(
      (key) => key.startsWith("__reactFiber") || key.startsWith("__reactInternalInstance")
    );

    if (reactInternalKey) {
      console.log(`🔧 Found React fiber, attempting direct state update`);

      // Set the native value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(input, valueStr);

      // Dispatch input event that React listens to
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        composed: true,
        data: valueStr,
        inputType: "insertText",
      });

      input.dispatchEvent(inputEvent);

      // Dispatch change event
      const changeEvent = new Event("change", {
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(changeEvent);

      console.log(`📝 Dispatched React events for value: ${valueStr}`);
      return;
    }

    // Method 3: Simulate actual typing (most aggressive)
    console.log(`🎯 Simulating user typing for value: ${valueStr}`);

    // Clear the input first
    input.value = "";
    input.focus();
    input.select();

    // Dispatch keydown, input, and keyup for each character
    for (let i = 0; i < valueStr.length; i++) {
      const char = valueStr[i];

      // Keydown
      const keydownEvent = new KeyboardEvent("keydown", {
        key: char,
        code: `Digit${char}`,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(keydownEvent);

      // Update value character by character
      input.value = valueStr.substring(0, i + 1);

      // Input event after each character
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: char,
        inputType: "insertText",
      });
      input.dispatchEvent(inputEvent);

      // Keyup
      const keyupEvent = new KeyboardEvent("keyup", {
        key: char,
        code: `Digit${char}`,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(keyupEvent);
    }

    // Final change and blur
    setTimeout(() => {
      const changeEvent = new Event("change", { bubbles: true });
      input.dispatchEvent(changeEvent);

      const blurEvent = new FocusEvent("blur", { bubbles: true });
      input.dispatchEvent(blurEvent);
      input.blur();

      console.log(`📝 Completed simulated typing for value: ${valueStr}`);
    }, 100);
  } catch (e) {
    console.warn("Error setting input value:", e);
    // Ultimate fallback
    input.value = String(value);
  }
}

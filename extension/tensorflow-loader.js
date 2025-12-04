// This script runs in the page context and loads TensorFlow.js
(function() {
  'use strict';
  
  console.log('TensorFlow loader script injected');
  
  // Load TensorFlow.js
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Listen for detection requests from content script
  window.addEventListener('TENSORFLOW_DETECT', async (event) => {
    try {
      const { imageData } = event.detail;
      
      console.log('Loading TensorFlow.js libraries...');
      
      // Load libraries if not already loaded
      if (!window.tf) {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js');
        console.log('✅ TensorFlow.js loaded');
      }
      
      if (!window.cocoSsd) {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        console.log('✅ COCO-SSD loaded');
      }
      
      // Create image from data
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          console.log('Loading COCO-SSD model...');
          const model = await window.cocoSsd.load();
          console.log('✅ Model loaded');
          
          console.log('Running detection...');
          const predictions = await model.detect(img);
          console.log(`Detected ${predictions.length} objects:`, predictions);
          
          // Send results back to content script
          window.dispatchEvent(new CustomEvent('TENSORFLOW_RESULT', {
            detail: { predictions }
          }));
          
        } catch (error) {
          console.error('Detection error:', error);
          window.dispatchEvent(new CustomEvent('TENSORFLOW_ERROR', {
            detail: { error: error.message }
          }));
        }
      };
      
      img.onerror = () => {
        window.dispatchEvent(new CustomEvent('TENSORFLOW_ERROR', {
          detail: { error: 'Failed to load image' }
        }));
      };
      
      img.src = imageData;
      
    } catch (error) {
      console.error('TensorFlow loading error:', error);
      window.dispatchEvent(new CustomEvent('TENSORFLOW_ERROR', {
        detail: { error: error.message }
      }));
    }
  });
  
  console.log('TensorFlow loader ready');
})();

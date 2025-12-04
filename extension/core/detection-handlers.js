/**
 * Detection Handlers Module
 * Handles all object detection API integrations
 */

/**
 * YOLOv12 Detection Handler
 */
async function handleYOLODetection(dataUrl, apiUrl) {
  console.log("⚡ Starting YOLOv12 detection...");

  try {
    const base64Image = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const detectedObjects = await detectWithYOLO(base64Image, apiUrl);

    // Capture current krpano view for accurate bounding box positioning
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    clearPreviousBoxes();
    displayDetectedObjects(detectedObjects, krpanoConfig);

    if (detectedObjects.length > 0) {
      console.log(`✅ YOLOv12 detected ${detectedObjects.length} objects: ${detectedObjects.map((obj) => obj.name).join(", ")}`);
    } else {
      console.log("ℹ️ No objects detected by YOLOv12");
    }
  } catch (error) {
    console.error("Error calling YOLO API:", error);
    handleYOLOError(error, apiUrl);
  }
}

/**
 * TensorFlow.js Detection Handler
 */
async function handleTensorFlowDetection(dataUrl) {
  console.log("🤖 Starting TensorFlow.js detection...");

  try {
    const detectedObjects = await detectWithTensorFlow(dataUrl);

    // Capture current krpano view for accurate bounding box positioning
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    displayDetectedObjects(detectedObjects, krpanoConfig);
    console.log(`✅ TensorFlow.js detected ${detectedObjects.length} objects!`);
  } catch (error) {
    console.error("TensorFlow.js Error:", error);
    alert(
      "⚠️ TensorFlow.js Detection Unavailable\n\n" +
        "This website has strict Content Security Policy (CSP) that prevents loading external ML models.\n\n" +
        "✅ ALTERNATIVE: Use YOLOv12, Roboflow or Google Vision API\n\n" +
        "YOLOv12 and Google Vision API work on all websites regardless of CSP restrictions."
    );
  }
}

/**
 * Roboflow Detection Handler
 */
async function handleRoboflowDetection(dataUrl, apiKey) {
  console.log("🤖 Starting Roboflow detection...");

  try {
    const base64Image = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const detectedObjects = await detectWithRoboflow(base64Image, apiKey);

    // Capture current krpano view for accurate bounding box positioning
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    clearPreviousBoxes();
    displayDetectedObjects(detectedObjects, krpanoConfig);

    if (detectedObjects.length > 0) {
      console.log(`✅ Roboflow detected ${detectedObjects.length} objects!`);
    } else {
      console.log("ℹ️ No objects detected by Roboflow");
    }
  } catch (error) {
    console.error("Error calling Roboflow API:", error);
    handleRoboflowError(error);
  }
}

/**
 * Google Vision Detection Handler
 */
async function handleGoogleVisionDetection(dataUrl, apiKey) {
  console.log("☁️ Starting Google Cloud Vision API...");

  try {
    const base64Image = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const result = await detectWithGoogleVision(base64Image, apiKey);

    // Capture current krpano view for accurate bounding box positioning
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    clearPreviousBoxes();
    displayDetectedObjects(result.objects, krpanoConfig);

    if (result.objects.length > 0) {
      console.log(`✅ Google Vision detected ${result.objects.length} objects successfully!`);
    } else {
      console.log("ℹ️ No objects detected by Google Vision");
    }
  } catch (error) {
    console.error("Error calling Vision API:", error);
    alert("Error calling Vision API. Check console for details.");
  }
}

/**
 * AWS Rekognition Detection Handler
 */
async function handleAWSDetection(dataUrl, awsConfig) {
  console.log("☁️ Starting AWS Rekognition detection...");

  try {
    const base64Image = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const detectedObjects = await detectWithAWSRekognition(base64Image, awsConfig);

    // Capture current krpano view for accurate bounding box positioning
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    displayDetectedObjects(detectedObjects, krpanoConfig);
    console.log(`✅ AWS Rekognition detected ${detectedObjects.length} objects!`);
  } catch (error) {
    console.error("AWS Rekognition Error:", error);
    alert(
      "⚠️ AWS Rekognition Integration\n\n" +
        "AWS Rekognition requires:\n" +
        "1. AWS Account with Rekognition enabled\n" +
        "2. Access Key ID + Secret Access Key\n" +
        "3. AWS SDK or signed API requests\n\n" +
        "Due to browser security limitations, AWS requires a backend server or AWS SDK.\n\n" +
        "Recommendation:\n" +
        "• Use Roboflow API (simpler, no backend needed)\n" +
        "• Or train a custom Roboflow model\n" +
        "• Or switch to Google Vision API"
    );
  }
}

/**
 * Error handler for YOLO API
 */
function handleYOLOError(error, apiUrl) {
  if (error.message.includes("NGROK_URL_REQUIRED")) {
    alert(
      `⚠️ Ngrok URL Required\n\n` +
        `This website blocks localhost requests due to Content Security Policy (CSP).\n\n` +
        `You MUST use your Ngrok public URL:\n\n` +
        `1. Check your terminal where you ran: python app.py\n` +
        `2. Copy the Ngrok URL (e.g., https://xxxxx.ngrok-free.dev)\n` +
        `3. Paste it in the extension's URL field\n\n` +
        `Your current URL: ${apiUrl || "(empty)"}`
    );
  } else if (error.message.includes("Cannot connect")) {
    alert(
      `❌ Cannot Connect to YOLO Server\n\n` +
        `Make sure your Python server is running:\n\n` +
        `1. Open terminal in vr-360-yolo-v12 folder\n` +
        `2. Run: python app.py\n` +
        `3. Copy the Ngrok URL from terminal\n` +
        `4. Paste it in the extension\n\n` +
        `Server URL: ${apiUrl || "(not provided)"}`
    );
  } else {
    alert(`❌ YOLO API Error\n\n${error.message}\n\nCheck console for details.`);
  }
}

/**
 * Error handler for Roboflow API
 */
function handleRoboflowError(error) {
  if (error.message.includes("QUOTA_EXCEEDED")) {
    alert(
      "❌ Roboflow Quota Exceeded\n\n" +
        "⚠️ You have used up your free API calls for this month!\n\n" +
        "Free tier: 1,000 API calls/month\n\n" +
        "Solutions:\n" +
        "1. Wait until next month for quota reset\n" +
        "2. Upgrade to a paid plan at roboflow.com/pricing\n" +
        "3. Create a new Roboflow account (temporary solution)\n" +
        "4. Use Google Vision API instead (select from dropdown)\n\n" +
        "📊 Check usage: https://app.roboflow.com/usage"
    );
  } else if (error.message.includes("404")) {
    alert(
      "❌ Roboflow API Error\n\n" +
        "Model not found. Please check:\n\n" +
        "1. Your API key is correct\n" +
        "2. Model ID format: workspace/model/version\n" +
        "   Example: my-workspace/object-detection/1\n\n" +
        "3. Go to https://roboflow.com to get your model details"
    );
  } else if (error.message.includes("FORBIDDEN")) {
    alert(
      "❌ Roboflow Access Denied\n\n" +
        "The API key doesn't have access to this model.\n\n" +
        "Possible causes:\n" +
        "1. Wrong API key\n" +
        "2. Model is private and key doesn't have access\n" +
        "3. Check your key at: https://app.roboflow.com/settings/api\n\n" +
        error.message
    );
  } else if (error.message.includes("401")) {
    alert(
      "❌ Authentication Error\n\n" +
        "Your Roboflow API key is invalid.\n\n" +
        "Get your PRIVATE API key from:\n" +
        'https://app.roboflow.com/settings/api → "Private API Key" section'
    );
  } else {
    alert(`❌ Roboflow API Error\n\n${error.message}\n\nCheck console for details.`);
  }
}

/**
 * Clear previous bounding boxes
 */
function clearPreviousBoxes() {
  document.querySelectorAll(".vr-auto-polygon-box").forEach((el) => el.remove());
}

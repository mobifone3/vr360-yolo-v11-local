# Using YOLOv12 with VR 360 Extension - CSP Fix

## ⚠️ Important: Localhost Blocked by CSP

The VR 360 Mobifone website has Content Security Policy (CSP) that **blocks localhost requests**.

You **MUST** use the Ngrok public URL.

## ✅ How to Use:

### 1. Make sure your YOLO server is running:

```bash
cd vr-360-yolo-v12
python app.py
```

### 2. Copy the Ngrok URL from the terminal:

Look for this line in your terminal:
```
📡 Public URL: https://eponymous-probankruptcy-josiah.ngrok-free.dev
```

Copy the URL: `https://eponymous-probankruptcy-josiah.ngrok-free.dev`

### 3. Reload the Chrome Extension:

1. Go to `chrome://extensions/`
2. Find "VR 360 Object Detector"
3. Click the **Reload** button 🔄

### 4. Use the Extension:

1. Open the VR 360 tour: `smarttravel-vr.mobifone.vn`
2. Click the extension icon
3. "YOLOv12 API" should be selected
4. **Paste your Ngrok URL** in the text field:
   ```
   https://eponymous-probankruptcy-josiah.ngrok-free.dev
   ```
5. Click "Detect Objects"

## 🚫 What WON'T Work:

- ❌ `http://127.0.0.1:5000` - Blocked by CSP
- ❌ `http://localhost:5000` - Blocked by CSP
- ❌ Any localhost address - Blocked by CSP
- ❌ Leaving the field empty - Will show error

## ✅ What WILL Work:

- ✅ Your Ngrok URL: `https://your-url.ngrok-free.dev`
- ✅ Any public HTTPS URL where your API is hosted

## 🔧 Troubleshooting:

### "Ngrok URL Required" Error
→ You must enter your Ngrok public URL from the terminal

### "Cannot Connect to YOLO Server"
→ Make sure `python app.py` is running and showing the Ngrok URL

### Ngrok URL Changed
→ Each time you restart the server, you get a new Ngrok URL
→ Copy the new URL and update it in the extension

## 📝 Current Setup:

Your server is running at:
- **Public (Ngrok)**: `https://eponymous-probankruptcy-josiah.ngrok-free.dev` ✅ USE THIS
- **Local**: `http://127.0.0.1:5000` ❌ WON'T WORK (blocked by CSP)

## Why This Is Necessary:

The Mobifone VR website has this security header:
```
Content-Security-Policy: ... connect-src 'self' ...
```

This means the website can only make requests to:
- Same domain (mobifone.vn)
- HTTPS public URLs (like ngrok)

It CANNOT make requests to:
- localhost
- 127.0.0.1
- Any local IP address

This is a browser security feature and cannot be bypassed from the extension.

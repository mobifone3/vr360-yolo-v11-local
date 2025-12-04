import cv2
import numpy as np
from PIL import Image

class ImageService:
    @staticmethod
    def detect_picture_frames(image, min_area=5000, max_area=100000):
        """
        Detect rectangular picture frames using edge detection and contour analysis
        
        Args:
            image: PIL Image or numpy array
            min_area: Minimum area for a valid frame (default 5000 pixels)
            max_area: Maximum area for a valid frame (default 100000 pixels)
        
        Returns:
            List of frame detections with bbox coordinates
        """
        # Convert PIL Image to numpy array if needed
        if isinstance(image, Image.Image):
            img_array = np.array(image)
        else:
            img_array = image
        
        # Convert to grayscale
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply Canny edge detection
        edges = cv2.Canny(blurred, 50, 150)
        
        # Dilate edges to close gaps
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        frame_detections = []
        
        for contour in contours:
            # Calculate contour area
            area = cv2.contourArea(contour)
            
            # Filter by area
            if area < min_area or area > max_area:
                continue
            
            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Check if it's roughly rectangular (4 corners)
            if len(approx) >= 4 and len(approx) <= 8:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate aspect ratio
                aspect_ratio = float(w) / h if h > 0 else 0
                
                # Filter frames: aspect ratio between 0.3 and 3.0 (not too thin)
                if 0.3 < aspect_ratio < 3.0:
                    # Calculate confidence based on how rectangular it is
                    # More sides = less rectangular = lower confidence
                    confidence = max(0.4, 1.0 - (len(approx) - 4) * 0.1)
                    
                    detection = {
                        'class': 'picture_frame',
                        'class_id': -1,  # Custom class
                        'confidence': round(confidence, 4),
                        'bbox': {
                            'x1': float(x),
                            'y1': float(y),
                            'x2': float(x + w),
                            'y2': float(y + h),
                            'width': float(w),
                            'height': float(h)
                        }
                    }
                    frame_detections.append(detection)
        

        return frame_detections


    @staticmethod
    def segment_generic_object(image, grabcut_rect=None):
        """
        Segment the most prominent object in the image using GrabCut and contours.
        Useful when YOLO fails to detect a specific class.
        
        Args:
            image: PIL Image or numpy array
            grabcut_rect: Optional (x, y, w, h) tuple for GrabCut initialization. 
                          If None, uses the whole image with a small margin.
            
        Returns:
            Dictionary with 'polygon' and 'bbox' or None if failed
        """
        # Convert PIL Image to numpy array if needed
        if isinstance(image, Image.Image):
            img_array = np.array(image)
        else:
            img_array = image
            
        # Ensure RGB
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        elif img_array.shape[2] == 4:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
            
        height, width = img_array.shape[:2]
        
        # Pre-processing: Enhance contrast if image is dark
        # Convert to LAB color space
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L-channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        
        # Merge and convert back to RGB
        limg = cv2.merge((cl,a,b))
        enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        
        # Use enhanced image for processing
        processing_img = enhanced_img
        
        # 1. Try GrabCut initialized with a center rectangle
        mask = np.zeros(img_array.shape[:2], np.uint8)
        bgdModel = np.zeros((1, 65), np.float64)
        fgdModel = np.zeros((1, 65), np.float64)
        
        # Define a rectangle for GrabCut
        if grabcut_rect:
            rect = grabcut_rect
        else:
            # Default: leave a small border
            margin = 2
            rect = (margin, margin, width - 2*margin, height - 2*margin)
        
        try:
            cv2.grabCut(processing_img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
            
            # Modify mask: 0 and 2 are background, 1 and 3 are foreground
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Find contours in the mask
            contours, _ = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            

            if contours:
                # Get largest contour
                c = max(contours, key=cv2.contourArea)
                

                # Simplify contour (use smaller epsilon for more detail)
                epsilon = 0.002 * cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, epsilon, True)
                
                # Get bounding box
                x, y, w, h = cv2.boundingRect(c)
                
                # Create polygon points
                polygon = []
                for point in approx:
                    polygon.append({
                        'x': float(point[0][0]),
                        'y': float(point[0][1])
                    })
                    
                return {
                    'class': 'generic_object',
                    'class_id': -2,
                    'confidence': 0.8, # Artificial confidence
                    'polygon': polygon,
                    'bbox': {
                        'x1': float(x),
                        'y1': float(y),
                        'x2': float(x + w),
                        'y2': float(y + h),
                        'width': float(w),

                        'height': float(h)
                    }
                }
        except Exception as e:
            print(f"GrabCut failed: {e}")
            
        print("⚠️ GrabCut failed or found no contours, trying fallback...")

        # 2. Fallback: Saliency / Edge detection if GrabCut fails
        # Convert to grayscale
        gray = cv2.cvtColor(processing_img, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Otsu's thresholding
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            c = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(c)
            

            # If the contour is basically the whole image, it's probably wrong
            # Relaxed check: allow up to 98% coverage
            if w > width * 0.98 and h > height * 0.98:
                print("❌ Fallback contour covers entire image, ignoring.")
                return None
                
            epsilon = 0.002 * cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, epsilon, True)
            
            polygon = []
            for point in approx:
                polygon.append({
                    'x': float(point[0][0]),
                    'y': float(point[0][1])
                })
                
            return {
                'class': 'generic_object',
                'class_id': -2,
                'confidence': 0.5,
                'polygon': polygon,
                'bbox': {
                    'x1': float(x),
                    'y1': float(y),
                    'x2': float(x + w),
                    'y2': float(y + h),
                    'width': float(w),
                    'height': float(h)
                }
            }
            
        return None

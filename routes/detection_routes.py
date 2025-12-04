from flask import Blueprint, request, jsonify
from config import Config
from services.yolo_service import YoloService
from services.image_service import ImageService
from PIL import Image
import io
import traceback
import os

detection_bp = Blueprint('detection', __name__)

@detection_bp.route('/detect', methods=['POST'])
def detect_objects():
    """
    Object detection endpoint
    Accepts: multipart/form-data with 'image' file
    Returns: JSON with detected objects
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image provided',
                'message': 'Please upload an image file with key "image"'
            }), 400

        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'Empty filename',
                'message': 'Please select a valid image file'
            }), 400

        # Get confidence threshold from query params if provided
        confidence = float(request.args.get('confidence', Config.CONFIDENCE_THRESHOLD))
        
        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run inference
        yolo_service = YoloService.get_instance()
        results = yolo_service.detect(image, confidence=confidence)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Get confidence and class
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = yolo_service.names[cls]
                
                detection = {
                    'class': class_name,
                    'class_id': cls,
                    'confidence': round(conf, 4),
                    'bbox': {
                        'x1': round(x1, 2),
                        'y1': round(y1, 2),
                        'x2': round(x2, 2),
                        'y2': round(y2, 2),
                        'width': round(x2 - x1, 2),
                        'height': round(y2 - y1, 2)
                    }
                }
                detections.append(detection)
        
        # Prepare response
        response = {
            'success': True,
            'image_size': {
                'width': image.width,
                'height': image.height
            },
            'detections_count': len(detections),
            'detections': detections,
            'confidence_threshold': confidence
        }
        
        return jsonify(response)
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error during detection: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred during object detection'
        }), 500


@detection_bp.route('/detect/url', methods=['POST'])
def detect_from_url():
    """
    Object detection from image URL
    Accepts: JSON with 'url' field
    Returns: JSON with detected objects
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'error': 'No URL provided',
                'message': 'Please provide image URL in JSON body with key "url"'
            }), 400
        
        url = data['url']
        confidence = float(data.get('confidence', Config.CONFIDENCE_THRESHOLD))
        
        # Run inference directly on URL (YOLO supports this)
        yolo_service = YoloService.get_instance()
        results = yolo_service.detect(url, confidence=confidence)
        
        # Process results (same as above)
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = yolo_service.names[cls]
                
                detection = {
                    'class': class_name,
                    'class_id': cls,
                    'confidence': round(conf, 4),
                    'bbox': {
                        'x1': round(x1, 2),
                        'y1': round(y1, 2),
                        'x2': round(x2, 2),
                        'y2': round(y2, 2),
                        'width': round(x2 - x1, 2),
                        'height': round(y2 - y1, 2)
                    }
                }
                detections.append(detection)
        
        response = {
            'success': True,
            'url': url,
            'detections_count': len(detections),
            'detections': detections,
            'confidence_threshold': confidence
        }
        
        return jsonify(response)
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error during detection from URL: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred during object detection'
        }), 500


@detection_bp.route('/detect/hybrid', methods=['POST'])
def detect_hybrid():
    """
    Hybrid detection: YOLO for objects + OpenCV for picture frames
    Accepts: multipart/form-data with 'image' file
    Returns: JSON with detected objects and frames
    """
    try:
        # Check if image is in request
        try:
            has_image = 'image' in request.files
        except Exception as e:
            # Handle client disconnect during upload
            if 'ClientDisconnected' in str(type(e).__name__):
                print('Client disconnected during upload - image too large or timeout')
                return jsonify({
                    'success': False,
                    'error': 'Upload timeout - image too large',
                    'message': 'Image upload timed out. Try with a smaller image or lower resolution.'
                }), 408
            raise
        
        if not has_image:
            return jsonify({
                'error': 'No image provided',
                'message': 'Please upload an image file with key "image"'
            }), 400

        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'Empty filename',
                'message': 'Please select a valid image file'
            }), 400

        # Get parameters
        confidence = float(request.args.get('confidence', Config.CONFIDENCE_THRESHOLD))
        detect_frames = request.args.get('detect_frames', 'true').lower() == 'true'
        min_frame_area = int(request.args.get('min_frame_area', 2000))
        max_frame_area = int(request.args.get('max_frame_area', 200000))
        
        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # DEBUG: Save received image for inspection
        debug_dir = 'debug_images'
        os.makedirs(debug_dir, exist_ok=True)
        debug_path = os.path.join(debug_dir, 'last_received.jpg')
        image.save(debug_path)
        print(f'🔍 DEBUG: Saved received image to {debug_path} ({image.size[0]}x{image.size[1]})')
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run YOLO inference
        yolo_service = YoloService.get_instance()
        results = yolo_service.detect(image, confidence=confidence)
        
        # Process YOLO results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = yolo_service.names[cls]
                
                detection = {
                    'class': class_name,
                    'class_id': cls,
                    'confidence': round(conf, 4),
                    'bbox': {
                        'x1': round(x1, 2),
                        'y1': round(y1, 2),
                        'x2': round(x2, 2),
                        'y2': round(y2, 2),
                        'width': round(x2 - x1, 2),
                        'height': round(y2 - y1, 2)
                    },
                    'source': 'yolo'
                }
                detections.append(detection)
        
        # Detect picture frames if enabled
        if detect_frames:
            frame_detections = ImageService.detect_picture_frames(image, min_frame_area, max_frame_area)
            for frame in frame_detections:
                frame['source'] = 'opencv'
                detections.append(frame)
        
        # Prepare response
        response = {
            'success': True,
            'image_size': {
                'width': image.width,
                'height': image.height
            },
            'detections_count': len(detections),
            'detections': detections,
            'confidence_threshold': confidence,
            'detection_method': 'hybrid (YOLO + OpenCV)'
        }
        
        return jsonify(response)
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error during hybrid detection: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred during hybrid detection'
        }), 500


@detection_bp.route('/detect/segment', methods=['POST'])
def detect_segment():
    """
    Segment object within a Region of Interest (ROI)
    Accepts: multipart/form-data with 'image' file and 'roi' JSON string
    Returns: JSON with detected object polygon
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image provided',
                'message': 'Please upload an image file with key "image"'
            }), 400

        file = request.files['image']
        roi_str = request.form.get('roi')
        
        if not roi_str:
            return jsonify({
                'error': 'No ROI provided',
                'message': 'Please provide ROI JSON string with key "roi"'
            }), 400
            
        import json
        roi = json.loads(roi_str)
        
        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Crop image to ROI
        # ROI: {x, y, width, height}
        x = int(roi.get('x', 0))
        y = int(roi.get('y', 0))
        w = int(roi.get('width', image.width))
        h = int(roi.get('height', image.height))
        

        # Ensure bounds
        x = max(0, x)
        y = max(0, y)
        w = min(w, image.width - x)
        h = min(h, image.height - y)
        
        print(f"✂️ Cropping to ROI: x={x}, y={y}, w={w}, h={h} (Image: {image.width}x{image.height})")
        
        cropped_image = image.crop((x, y, x + w, y + h))
        
        # DEBUG: Save cropped image
        debug_dir = 'debug_images'
        os.makedirs(debug_dir, exist_ok=True)
        cropped_path = os.path.join(debug_dir, 'last_cropped.jpg')
        cropped_image.save(cropped_path)
        print(f"🔍 DEBUG: Saved cropped image to {cropped_path}")
        
        # Run inference on crop
        # Use a lower threshold for focused detection
        confidence = float(request.args.get('confidence', 0.15)) 
        yolo_service = YoloService.get_instance()
        results = yolo_service.detect(cropped_image, confidence=confidence)
        
        detections = []

        # Process results
        detections = []
        for result in results:
            # Check for masks (segmentation)
            if result.masks:
                for i, mask in enumerate(result.masks.xy):
                    # ... (existing mask processing) ...
                    polygon = []
                    for point in mask:
                        polygon.append({
                            'x': float(point[0] + x),
                            'y': float(point[1] + y)
                        })
                    
                    box = result.boxes[i]
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = yolo_service.names[cls]
                    
                    detections.append({
                        'class': class_name,
                        'class_id': cls,
                        'confidence': round(conf, 4),
                        'polygon': polygon,
                        'bbox': {
                            'x1': float(box.xyxy[0][0] + x),
                            'y1': float(box.xyxy[0][1] + y),
                            'x2': float(box.xyxy[0][2] + x),
                            'y2': float(box.xyxy[0][3] + y)
                        }
                    })
            else:
                # Fallback: YOLO found a box but no mask.
                # Use the box to run GrabCut/Segmentation on that specific area.
                print("⚠️ YOLO detected object but no mask. Running refinement...")
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    class_name = yolo_service.names[cls]
                    

                    # Crop to the detected box with padding to include full object
                    box_x = int(x1)
                    box_y = int(y1)
                    box_w = int(x2 - x1)
                    box_h = int(y2 - y1)
                    
                    # Add padding (20% of size)
                    pad_w = int(box_w * 0.2)
                    pad_h = int(box_h * 0.2)
                    
                    crop_x = box_x - pad_w
                    crop_y = box_y - pad_h
                    crop_w = box_w + (pad_w * 2)
                    crop_h = box_h + (pad_h * 2)
                    
                    # Ensure valid crop
                    crop_x = max(0, crop_x)
                    crop_y = max(0, crop_y)
                    crop_w = min(crop_w, cropped_image.width - crop_x)
                    crop_h = min(crop_h, cropped_image.height - crop_y)
                    

                    if crop_w > 0 and crop_h > 0:
                        obj_crop = cropped_image.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
                        
                        # Calculate relative box position for GrabCut
                        # The object is at (pad_w, pad_h) inside the crop, with size (box_w, box_h)
                        # We give it a slight margin inside the box to be safe
                        gc_margin = 2
                        gc_rect = (
                            pad_w + gc_margin, 
                            pad_h + gc_margin, 
                            max(1, box_w - 2*gc_margin), 
                            max(1, box_h - 2*gc_margin)
                        )
                        
                        # Run generic segmentation on this crop
                        refined = ImageService.segment_generic_object(obj_crop, grabcut_rect=gc_rect)
                        
                        if refined and refined.get('polygon'):
                            # Adjust polygon coordinates to full image
                            adjusted_polygon = []
                            for point in refined['polygon']:
                                adjusted_polygon.append({
                                    'x': point['x'] + crop_x + x,
                                    'y': point['y'] + crop_y + y
                                })
                            
                            detections.append({
                                'class': class_name,
                                'class_id': cls,
                                'confidence': round(conf, 4),
                                'polygon': adjusted_polygon,
                                'bbox': {
                                    'x1': round(x1 + x, 2),
                                    'y1': round(y1 + y, 2),
                                    'x2': round(x2 + x, 2),
                                    'y2': round(y2 + y, 2)
                                }
                            })
                        else:
                            # Fallback to box if refinement fails
                            detections.append({
                                'class': class_name,
                                'class_id': cls,
                                'confidence': round(conf, 4),
                                'bbox': {
                                    'x1': round(x1 + x, 2),
                                    'y1': round(y1 + y, 2),
                                    'x2': round(x2 + x, 2),
                                    'y2': round(y2 + y, 2)
                                }
                            })

        # If no detections from YOLO, try generic segmentation
        if not detections:
            print("⚠️ No YOLO detections, trying generic segmentation...")
            generic_result = ImageService.segment_generic_object(cropped_image)
            
            if generic_result:
                print("✅ Generic segmentation successful")
                # Adjust coordinates to full image
                adjusted_polygon = []
                for point in generic_result['polygon']:
                    adjusted_polygon.append({
                        'x': point['x'] + x,
                        'y': point['y'] + y
                    })
                
                generic_result['polygon'] = adjusted_polygon
                
                # Adjust bbox
                bbox = generic_result['bbox']
                generic_result['bbox'] = {
                    'x1': bbox['x1'] + x,
                    'y1': bbox['y1'] + y,
                    'x2': bbox['x2'] + x,
                    'y2': bbox['y2'] + y,
                    'width': bbox['width'],
                    'height': bbox['height']
                }
                
                detections.append(generic_result)
            else:
                print("❌ Generic segmentation failed")

        return jsonify({
            'success': True,
            'detections': detections,
            'roi': roi
        })

    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error during segment detection: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

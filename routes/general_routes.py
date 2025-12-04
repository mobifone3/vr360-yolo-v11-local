from flask import Blueprint, jsonify
from config import Config
from services.yolo_service import YoloService

general_bp = Blueprint('general', __name__)

@general_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': Config.YOLO_MODEL_PATH,
        'confidence_threshold': Config.CONFIDENCE_THRESHOLD
    })

@general_bp.route('/classes', methods=['GET'])
def get_classes():
    """Get list of classes the model can detect"""
    yolo_service = YoloService.get_instance()
    return jsonify({
        'classes': yolo_service.names,
        'total_classes': len(yolo_service.names)
    })

@general_bp.route('/', methods=['GET'])
def index():
    """API documentation"""
    response = {
        'name': 'YOLOv12 Object Detection API',
        'version': '1.0.0',
        'endpoints': {
            '/health': {
                'method': 'GET',
                'description': 'Health check endpoint'
            },
            '/detect': {
                'method': 'POST',
                'description': 'Detect objects in uploaded image',
                'content_type': 'multipart/form-data',
                'parameters': {
                    'image': 'Image file (required)',
                    'confidence': 'Confidence threshold (optional, query param)'
                }
            },
            '/detect/url': {
                'method': 'POST',
                'description': 'Detect objects from image URL',
                'content_type': 'application/json',
                'parameters': {
                    'url': 'Image URL (required)',
                    'confidence': 'Confidence threshold (optional)'
                }
            },
            '/classes': {
                'method': 'GET',
                'description': 'Get list of detectable classes'
            },
            '/detect/hybrid': {
                'method': 'POST',
                'description': 'Hybrid detection: YOLO + OpenCV for picture frames',
                'content_type': 'multipart/form-data',
                'parameters': {
                    'image': 'Image file (required)',
                    'confidence': 'Confidence threshold for YOLO (optional, query param)',
                    'detect_frames': 'Enable frame detection (optional, default: true)',
                    'min_frame_area': 'Minimum frame area in pixels (optional, default: 5000)',
                    'max_frame_area': 'Maximum frame area in pixels (optional, default: 100000)'
                }
            },
            '/detect/segment': {
                'method': 'POST',
                'description': 'Segment object within a Region of Interest (ROI)',
                'content_type': 'multipart/form-data',
                'parameters': {
                    'image': 'Image file (required)',
                    'roi': 'ROI JSON string (required) {x, y, width, height}',
                    'confidence': 'Confidence threshold (optional, query param)'
                }
            }
        }
    }
    return jsonify(response)

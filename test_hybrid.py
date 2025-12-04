#!/usr/bin/env python3
"""
Test script for hybrid detection endpoint (YOLO + OpenCV frame detection)
"""

import requests
import json
import sys

# Configuration
API_URL = "http://localhost:5000/detect/hybrid"
IMAGE_PATH = "test_image.jpg"  # Change this to your test image path

def test_hybrid_detection(image_path=IMAGE_PATH, api_url=API_URL):
    """Test the hybrid detection endpoint"""
    print("="*60)
    print("Testing Hybrid Detection (YOLO + OpenCV)")
    print("="*60)
    print(f"API URL: {api_url}")
    print(f"Image: {image_path}")
    print()
    
    try:
        # Read image file
        with open(image_path, 'rb') as f:
            files = {'image': f}
            
            # Send request
            print("Sending request...")
            response = requests.post(api_url, files=files)
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            
            print("✓ Success!")
            print()
            print(f"Image size: {result['image_size']['width']}x{result['image_size']['height']}")
            print(f"Detection method: {result.get('detection_method', 'N/A')}")
            print(f"Total detections: {result['detections_count']}")
            print()
            
            # Count by source
            yolo_count = sum(1 for d in result['detections'] if d.get('source') == 'yolo')
            opencv_count = sum(1 for d in result['detections'] if d.get('source') == 'opencv')
            
            print(f"YOLO detections: {yolo_count}")
            print(f"OpenCV frame detections: {opencv_count}")
            print()
            
            # Show detections
            print("Detections:")
            print("-" * 60)
            for i, det in enumerate(result['detections'], 1):
                source = det.get('source', 'unknown')
                print(f"{i}. {det['class']} ({source})")
                print(f"   Confidence: {det['confidence']:.2%}")
                print(f"   Bbox: ({det['bbox']['x1']:.0f}, {det['bbox']['y1']:.0f}) -> "
                      f"({det['bbox']['x2']:.0f}, {det['bbox']['y2']:.0f})")
                print(f"   Size: {det['bbox']['width']:.0f}x{det['bbox']['height']:.0f}")
                print()
            
            return result
            
        else:
            print(f"✗ Error: {response.status_code}")
            print(response.text)
            return None
            
    except FileNotFoundError:
        print(f"✗ Error: Image file not found: {image_path}")
        print("\nPlease provide a valid image path")
        return None
    except requests.exceptions.ConnectionError:
        print(f"✗ Error: Cannot connect to API at {api_url}")
        print("\nMake sure the Flask server is running:")
        print("  python app.py")
        return None
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_parameters():
    """Test with different parameters"""
    print("\n" + "="*60)
    print("Testing with custom parameters")
    print("="*60)
    
    params = {
        'confidence': 0.5,
        'detect_frames': 'true',
        'min_frame_area': 3000,
        'max_frame_area': 150000
    }
    
    print(f"Parameters: {json.dumps(params, indent=2)}")
    print()
    
    try:
        with open(IMAGE_PATH, 'rb') as f:
            files = {'image': f}
            response = requests.post(API_URL, files=files, params=params)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Success! Found {result['detections_count']} objects")
        else:
            print(f"✗ Error: {response.status_code}")
            
    except FileNotFoundError:
        print(f"✗ Skipping parameter test (no image file)")
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    # Check if custom image path provided
    if len(sys.argv) > 1:
        IMAGE_PATH = sys.argv[1]
    
    # Run tests
    result = test_hybrid_detection()
    
    if result:
        # Test with custom parameters
        test_parameters()
        
        print("\n" + "="*60)
        print("Testing complete!")
        print("="*60)

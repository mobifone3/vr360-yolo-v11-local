#!/usr/bin/env python3
"""
Test client for YOLOv12 Object Detection API
"""

import requests
import sys
import json
from pathlib import Path


def test_health(base_url):
    """Test health endpoint"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    try:
        response = requests.get(f"{base_url}/health")
        response.raise_for_status()
        print("✓ Health check passed")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_detect_file(base_url, image_path, confidence=0.25):
    """Test object detection with file upload"""
    print("\n" + "="*50)
    print(f"Testing Object Detection (File Upload)")
    print(f"Image: {image_path}")
    print(f"Confidence: {confidence}")
    print("="*50)
    
    try:
        # Check if file exists
        if not Path(image_path).exists():
            print(f"✗ File not found: {image_path}")
            return False
        
        # Prepare the file
        with open(image_path, 'rb') as f:
            files = {'image': f}
            params = {'confidence': confidence}
            
            # Send request
            response = requests.post(
                f"{base_url}/detect",
                files=files,
                params=params,
                timeout=30
            )
            response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            print(f"✓ Detection successful")
            print(f"  Image size: {result['image_size']['width']}x{result['image_size']['height']}")
            print(f"  Objects detected: {result['detections_count']}")
            
            if result['detections_count'] > 0:
                print("\n  Detected objects:")
                for i, det in enumerate(result['detections'], 1):
                    print(f"    {i}. {det['class']} (confidence: {det['confidence']:.2%})")
                    bbox = det['bbox']
                    print(f"       Position: ({bbox['x1']:.0f}, {bbox['y1']:.0f}) to ({bbox['x2']:.0f}, {bbox['y2']:.0f})")
                    print(f"       Size: {bbox['width']:.0f}x{bbox['height']:.0f}")
            else:
                print("  No objects detected (try lowering confidence threshold)")
            
            print("\n  Full response:")
            print(json.dumps(result, indent=2))
            return True
        else:
            print(f"✗ Detection failed: {result.get('error', 'Unknown error')}")
            return False
            
    except requests.exceptions.Timeout:
        print("✗ Request timed out (inference may take longer for large images)")
        return False
    except Exception as e:
        print(f"✗ Detection failed: {e}")
        return False


def test_detect_url(base_url, image_url, confidence=0.25):
    """Test object detection with URL"""
    print("\n" + "="*50)
    print(f"Testing Object Detection (URL)")
    print(f"URL: {image_url}")
    print(f"Confidence: {confidence}")
    print("="*50)
    
    try:
        # Prepare the request
        payload = {
            'url': image_url,
            'confidence': confidence
        }
        
        # Send request
        response = requests.post(
            f"{base_url}/detect/url",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            print(f"✓ Detection successful")
            print(f"  Objects detected: {result['detections_count']}")
            
            if result['detections_count'] > 0:
                print("\n  Detected objects:")
                for i, det in enumerate(result['detections'], 1):
                    print(f"    {i}. {det['class']} (confidence: {det['confidence']:.2%})")
            
            print("\n  Full response:")
            print(json.dumps(result, indent=2))
            return True
        else:
            print(f"✗ Detection failed: {result.get('error', 'Unknown error')}")
            return False
            
    except requests.exceptions.Timeout:
        print("✗ Request timed out")
        return False
    except Exception as e:
        print(f"✗ Detection failed: {e}")
        return False


def test_classes(base_url):
    """Test classes endpoint"""
    print("\n" + "="*50)
    print("Testing Classes Endpoint")
    print("="*50)
    
    try:
        response = requests.get(f"{base_url}/classes")
        response.raise_for_status()
        result = response.json()
        
        print(f"✓ Total classes: {result['total_classes']}")
        print("\n  Sample classes:")
        classes = list(result['classes'].values())[:10]
        for cls in classes:
            print(f"    - {cls}")
        if result['total_classes'] > 10:
            print(f"    ... and {result['total_classes'] - 10} more")
        
        return True
    except Exception as e:
        print(f"✗ Failed to get classes: {e}")
        return False


def main():
    """Main test function"""
    # Configuration
    BASE_URL = "http://0.0.0.0:5000"
    CONFIDENCE = 0.25
    
    print("\n" + "="*70)
    print("YOLOv12 Object Detection API - Test Client")
    print("="*70)
    print(f"Server URL: {BASE_URL}")
    
    # Check if image path is provided
    if len(sys.argv) < 2:
        print("\nUsage: python test_client.py <image_path> [confidence] [server_url]")
        print("\nExamples:")
        print("  python test_client.py image.jpg")
        print("  python test_client.py image.jpg 0.5")
        print("  python test_client.py image.jpg 0.3 http://192.168.1.100:5000")
        print("\nRunning basic tests without image...")
        
        # Run basic tests
        test_health(BASE_URL)
        test_classes(BASE_URL)
        
        print("\n" + "="*70)
        print("To test object detection, provide an image path:")
        print("  python test_client.py path/to/image.jpg")
        print("="*70)
        return
    
    # Get parameters
    image_path = sys.argv[1]
    
    if len(sys.argv) > 2:
        try:
            CONFIDENCE = float(sys.argv[2])
        except ValueError:
            print(f"Warning: Invalid confidence value '{sys.argv[2]}', using default 0.25")
    
    if len(sys.argv) > 3:
        BASE_URL = sys.argv[3]
    
    # Run all tests
    results = []
    results.append(("Health Check", test_health(BASE_URL)))
    results.append(("Classes", test_classes(BASE_URL)))
    results.append(("File Detection", test_detect_file(BASE_URL, image_path, CONFIDENCE)))
    
    # Optional: Test URL detection with a sample image
    # Uncomment to test URL detection
    # sample_url = "https://ultralytics.com/images/bus.jpg"
    # results.append(("URL Detection", test_detect_url(BASE_URL, sample_url, CONFIDENCE)))
    
    # Summary
    print("\n" + "="*70)
    print("Test Summary")
    print("="*70)
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("="*70)


if __name__ == "__main__":
    main()

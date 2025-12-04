#!/usr/bin/env python3
"""
YOLOv12 Object Detection API Server
A lightweight Flask-based API for serving YOLOv12 model predictions
"""

from flask import Flask, jsonify
from flask_cors import CORS
from pyngrok import ngrok, conf
from werkzeug.exceptions import RequestEntityTooLarge
from config import Config
from routes.general_routes import general_bp
from routes.detection_routes import detection_bp

app = Flask(__name__)

# Set maximum upload size (10MB)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

# Enable CORS for all routes and origins (needed for browser extensions)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Register Blueprints
app.register_blueprint(general_bp)
app.register_blueprint(detection_bp)

# Error handler for file too large
@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({
        'success': False,
        'error': 'File too large',
        'message': 'Image file exceeds 10MB limit. Please use a smaller image or lower resolution.'
    }), 413

# Validate and display configuration
Config.validate()
Config.display()

# Global variable to store ngrok tunnel URL
ngrok_tunnel = None

def start_ngrok():
    """Start ngrok tunnel"""
    global ngrok_tunnel
    
    if not Config.USE_NGROK:
        return
    
    try:
        # Set ngrok auth token
        conf.get_default().auth_token = Config.NGROK_AUTH_TOKEN
        
        # Start ngrok tunnel
        print("\n" + "="*60)
        print("Starting ngrok tunnel...")
        print("="*60)
        
        tunnel = ngrok.connect(Config.PORT, bind_tls=True)
        ngrok_tunnel = tunnel.public_url
        
        print(f"\n🌐 Ngrok tunnel established!")
        print(f"📡 Public URL: {ngrok_tunnel}")
        print(f"🔗 You can now access your API from anywhere using this URL")
        print("\n" + "="*60 + "\n")
        
        # Keep ngrok tunnel info available
        tunnels = ngrok.get_tunnels()
        for tunnel in tunnels:
            print(f"Active tunnel: {tunnel.public_url} -> {tunnel.config['addr']}")
        
    except Exception as e:
        print(f"❌ Error starting ngrok: {e}")
        print("⚠️  Server will still run locally")


def shutdown_ngrok():
    """Shutdown ngrok tunnel"""
    if Config.USE_NGROK:
        try:
            ngrok.kill()
            print("\n✓ Ngrok tunnel closed")
        except:
            pass


if __name__ == '__main__':
    try:
        # Start ngrok if enabled
        if Config.USE_NGROK:
            start_ngrok()
        
        print(f"\n{'='*60}")
        print(f"🚀 Starting YOLOv12 Object Detection API Server")
        print(f"{'='*60}")
        print(f"Local URL: http://{Config.HOST}:{Config.PORT}")
        if ngrok_tunnel:
            print(f"Public URL: {ngrok_tunnel}")
        print(f"{'='*60}\n")
        
        # Run Flask app
        app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, threaded=True)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Shutting down server...")
        shutdown_ngrok()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        shutdown_ngrok()
        raise
    finally:
        # Always cleanup ngrok on exit
        shutdown_ngrok()
        print("Server stopped.")

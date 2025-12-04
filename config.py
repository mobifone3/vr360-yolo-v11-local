#!/usr/bin/env python3
"""
Configuration loader for YOLOv12 API Server
Loads configuration from .env file and environment variables
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


class Config:
    """Application configuration"""
    
    # Ngrok Configuration
    NGROK_AUTH_TOKEN = os.getenv('NGROK_AUTH_TOKEN', '')
    USE_NGROK = os.getenv('USE_NGROK', 'True').lower() == 'true'
    
    # Server Configuration
    HOST = os.getenv('HOST', '127.0.0.1')
    PORT = int(os.getenv('PORT', '5000'))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # YOLO Model Configuration
    YOLO_MODEL_PATH = os.getenv('YOLO_MODEL_PATH', 'yolov8n.pt')
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.25'))
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if cls.USE_NGROK and not cls.NGROK_AUTH_TOKEN:
            raise ValueError("NGROK_AUTH_TOKEN is required when USE_NGROK is True")
        
        if cls.PORT < 1 or cls.PORT > 65535:
            raise ValueError(f"Invalid PORT: {cls.PORT}. Must be between 1-65535")
        
        if cls.CONFIDENCE_THRESHOLD < 0 or cls.CONFIDENCE_THRESHOLD > 1:
            raise ValueError(f"Invalid CONFIDENCE_THRESHOLD: {cls.CONFIDENCE_THRESHOLD}. Must be between 0-1")
    
    @classmethod
    def display(cls):
        """Display configuration (hiding sensitive data)"""
        print("\n" + "="*60)
        print("Server Configuration")
        print("="*60)
        print(f"Host: {cls.HOST}")
        print(f"Port: {cls.PORT}")
        print(f"Debug: {cls.DEBUG}")
        print(f"Model: {cls.YOLO_MODEL_PATH}")
        print(f"Confidence Threshold: {cls.CONFIDENCE_THRESHOLD}")
        print(f"Use Ngrok: {cls.USE_NGROK}")
        if cls.USE_NGROK:
            masked_token = cls.NGROK_AUTH_TOKEN[:8] + "..." + cls.NGROK_AUTH_TOKEN[-8:] if len(cls.NGROK_AUTH_TOKEN) > 16 else "***"
            print(f"Ngrok Token: {masked_token}")
        print("="*60 + "\n")

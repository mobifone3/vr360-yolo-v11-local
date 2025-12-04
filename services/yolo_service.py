from ultralytics import YOLO
from config import Config
import threading

class YoloService:
    _instance = None
    _lock = threading.Lock()
    model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def __init__(self):
        if YoloService.model is None:
            print(f"Loading YOLO model from: {Config.YOLO_MODEL_PATH}")
            YoloService.model = YOLO(Config.YOLO_MODEL_PATH)
            print("Model loaded successfully!")

    def detect(self, source, confidence=0.25, **kwargs):
        return self.model(source, conf=confidence, verbose=False, **kwargs)

    @property
    def names(self):
        return self.model.names

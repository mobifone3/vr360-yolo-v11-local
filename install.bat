@echo off
echo ============================================================
echo Installing YOLOv12 API Server Dependencies
echo ============================================================
echo.

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 2: Installing core dependencies (Flask, etc.)...
python -m pip install flask werkzeug jinja2 itsdangerous click blinker pyngrok python-dotenv requests

echo.
echo Step 3: Installing PyTorch (CPU version for faster install)...
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

echo.
echo Step 4: Installing numpy and opencv...
python -m pip install numpy pillow opencv-python

echo.
echo Step 5: Installing ultralytics (YOLO)...
python -m pip install ultralytics

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo You can now run the server with:
echo     python app.py
echo.
pause

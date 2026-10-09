#!/bin/bash

# Trendora API Service Fix Script
# This script fixes the systemd service configuration

echo "=== Trendora API Service Fix ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Set variables
PROJECT_DIR="/var/www/trendoraventures/trendoraventures"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="/var/www/trendoraventures/venv"
SERVICE_FILE="$PROJECT_DIR/trendora-api.service"

echo "Step 1: Creating logs directory..."
mkdir -p "$BACKEND_DIR/logs"
chown -R www-data:www-data "$BACKEND_DIR/logs"
echo "✓ Logs directory created"
echo ""

echo "Step 2: Checking virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    echo "✗ Virtual environment not found at $VENV_DIR"
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "✓ Virtual environment created"
fi
echo "✓ Virtual environment exists"
echo ""

echo "Step 3: Installing/updating dependencies..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"
echo "✓ Dependencies installed"
echo ""

echo "Step 4: Checking wsgi.py..."
if [ ! -f "$BACKEND_DIR/wsgi.py" ]; then
    echo "✗ wsgi.py not found!"
    exit 1
fi
echo "✓ wsgi.py exists"
echo ""

echo "Step 5: Copying systemd service file..."
cp "$SERVICE_FILE" /etc/systemd/system/trendora-api.service
echo "✓ Service file copied"
echo ""

echo "Step 6: Reloading systemd..."
systemctl daemon-reload
echo "✓ Systemd reloaded"
echo ""

echo "Step 7: Enabling service..."
systemctl enable trendora-api
echo "✓ Service enabled"
echo ""

echo "Step 8: Starting service..."
systemctl start trendora-api
echo "✓ Service started"
echo ""

echo "Step 9: Checking service status..."
sleep 2
systemctl status trendora-api --no-pager
echo ""

echo "Step 10: Testing API..."
sleep 2
echo "Testing health endpoint..."
curl -s http://127.0.0.1:8000/api/health || echo "API not responding yet"
echo ""

echo "=== Setup Complete ==="
echo ""
echo "Useful commands:"
echo "  Check status:  sudo systemctl status trendora-api"
echo "  View logs:     sudo journalctl -u trendora-api -f"
echo "  Restart:       sudo systemctl restart trendora-api"
echo "  Stop:          sudo systemctl stop trendora-api"
echo ""
echo "Log files:"
echo "  Access:  $BACKEND_DIR/logs/gunicorn-access.log"
echo "  Error:   $BACKEND_DIR/logs/gunicorn-error.log"
echo "  App:     $BACKEND_DIR/logs/trendora.log"

#!/bin/bash

# Trendora Ventures - Quick Deployment Script
# This script automates the deployment process on Ubuntu VPS

set -e  # Exit on error

echo "========================================="
echo "Trendora Ventures Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Configuration
PROJECT_DIR="/var/www/trendoraventures/trendoraventures"
VENV_DIR="/var/www/trendoraventures/venv"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${YELLOW}Step 1: Creating directories...${NC}"
mkdir -p /var/www/trendoraventures
mkdir -p $BACKEND_DIR/logs
mkdir -p $BACKEND_DIR/uploads/products
mkdir -p $BACKEND_DIR/uploads/bulk_images

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Setting up Python virtual environment...${NC}"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv $VENV_DIR
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Installing Python dependencies...${NC}"
source $VENV_DIR/bin/activate
pip install --upgrade pip
cd $BACKEND_DIR
pip install -r requirements.txt
pip install gunicorn
deactivate
echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 4: Setting permissions...${NC}"
chown -R www-data:www-data /var/www/trendoraventures
chmod -R 755 /var/www/trendoraventures
chmod -R 775 $BACKEND_DIR/uploads
chmod -R 775 $BACKEND_DIR/logs
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

echo -e "${YELLOW}Step 5: Configuring systemd service...${NC}"
if [ -f "$PROJECT_DIR/trendora-api.service" ]; then
    cp $PROJECT_DIR/trendora-api.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable trendora-api
    echo -e "${GREEN}✓ Service configured${NC}"
else
    echo -e "${RED}✗ Service file not found${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    cp $PROJECT_DIR/nginx.conf /etc/nginx/sites-available/trendoraventures.conf
    ln -sf /etc/nginx/sites-available/trendoraventures.conf /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && echo -e "${GREEN}✓ Nginx configuration valid${NC}" || echo -e "${RED}✗ Nginx configuration error${NC}"
else
    echo -e "${RED}✗ Nginx config file not found${NC}"
fi
echo ""

echo -e "${YELLOW}Step 7: Starting services...${NC}"
systemctl restart trendora-api
systemctl reload nginx
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Initialize database: cd $BACKEND_DIR && source $VENV_DIR/bin/activate && python init_db.py"
echo "2. Configure SSL: sudo certbot --nginx -d trendoraventures.in -d www.trendoraventures.in"
echo "3. Check service status: sudo systemctl status trendora-api"
echo "4. View logs: sudo journalctl -u trendora-api -f"
echo ""

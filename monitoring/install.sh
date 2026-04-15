#!/bin/bash

# K-System Installation Script
# ================================

set -e

echo "=========================================="
echo "   K-System Installation Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
INSTALL_DIR="$HOME/k-system"
GITHUB_REPO="https://github.com/pavinee23/monitoring.git"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "กรุณาอย่ารันด้วย sudo โดยตรง ให้รันเป็น user ปกติ"
    exit 1
fi

echo ""
echo "ขั้นตอนที่ 1: ติดตั้ง Node.js"
echo "-------------------------------------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "Node.js ติดตั้งแล้ว ($NODE_VERSION)"
else
    print_warning "กำลังติดตั้ง Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_status "ติดตั้ง Node.js สำเร็จ"
fi

echo ""
echo "ขั้นตอนที่ 2: ติดตั้ง ngrok"
echo "-------------------------------------------"
if command -v ngrok &> /dev/null; then
    print_status "ngrok ติดตั้งแล้ว"
else
    print_warning "กำลังติดตั้ง ngrok..."
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install -y ngrok
    print_status "ติดตั้ง ngrok สำเร็จ"
fi

echo ""
echo "ขั้นตอนที่ 3: Clone โปรเจค"
echo "-------------------------------------------"
if [ -d "$INSTALL_DIR" ]; then
    print_warning "โฟลเดอร์ $INSTALL_DIR มีอยู่แล้ว"
    read -p "ต้องการ pull ล่าสุดมั๊ย? (y/n): " PULL_CHOICE
    if [ "$PULL_CHOICE" = "y" ]; then
        cd "$INSTALL_DIR"
        git pull
        print_status "Pull สำเร็จ"
    fi
else
    git clone "$GITHUB_REPO" "$INSTALL_DIR"
    print_status "Clone สำเร็จ"
fi

cd "$INSTALL_DIR"

echo ""
echo "ขั้นตอนที่ 4: ติดตั้ง Dependencies"
echo "-------------------------------------------"
npm install
print_status "ติดตั้ง dependencies สำเร็จ"

echo ""
echo "ขั้นตอนที่ 5: ตั้งค่า Environment"
echo "-------------------------------------------"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "สร้างไฟล์ .env.local แล้ว กรุณาแก้ไขค่าตามต้องการ"
        print_warning "รัน: nano $INSTALL_DIR/.env.local"
    else
        print_warning "ไม่พบ .env.example กรุณาสร้าง .env.local เอง"
    fi
else
    print_status ".env.local มีอยู่แล้ว"
fi

echo ""
echo "ขั้นตอนที่ 6: Build โปรเจค"
echo "-------------------------------------------"
npm run build
print_status "Build สำเร็จ"

echo ""
echo "ขั้นตอนที่ 7: ตั้งค่า ngrok"
echo "-------------------------------------------"
read -p "ใส่ ngrok authtoken (หรือกด Enter เพื่อข้าม): " NGROK_TOKEN
if [ -n "$NGROK_TOKEN" ]; then
    ngrok config add-authtoken "$NGROK_TOKEN"
    print_status "ตั้งค่า ngrok authtoken สำเร็จ"

    # Create ngrok config
    mkdir -p ~/.config/ngrok
    cat > ~/.config/ngrok/ngrok.yml << 'NGROK_EOF'
version: "3"
agent:
    authtoken: NGROK_TOKEN_PLACEHOLDER

tunnels:
  server_app:
    proto: http
    addr: 3001
    domain: YOUR_DOMAIN.ngrok.app

  mysql:
    proto: tcp
    addr: 3306
NGROK_EOF

    # Replace token
    sed -i "s/NGROK_TOKEN_PLACEHOLDER/$NGROK_TOKEN/" ~/.config/ngrok/ngrok.yml
    print_warning "กรุณาแก้ไข domain ใน ~/.config/ngrok/ngrok.yml"
else
    print_warning "ข้ามการตั้งค่า ngrok"
fi

echo ""
echo "ขั้นตอนที่ 8: ตั้งค่า Systemd Services"
echo "-------------------------------------------"
read -p "ต้องการตั้งค่าให้รันอัตโนมัติตอนเปิดเครื่องมั๊ย? (y/n): " SYSTEMD_CHOICE
if [ "$SYSTEMD_CHOICE" = "y" ]; then

    # Next.js service
    sudo tee /etc/systemd/system/nextjs.service > /dev/null << EOF
[Unit]
Description=Next.js K-System App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    # ngrok service
    sudo tee /etc/systemd/system/ngrok.service > /dev/null << EOF
[Unit]
Description=ngrok Tunnels
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/ngrok start --all --config $HOME/.config/ngrok/ngrok.yml
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable nextjs ngrok
    sudo systemctl start nextjs ngrok

    print_status "ตั้งค่า systemd สำเร็จ"
else
    print_warning "ข้ามการตั้งค่า systemd"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}   ติดตั้งเสร็จสมบูรณ์!${NC}"
echo "=========================================="
echo ""
echo "คำสั่งที่ใช้บ่อย:"
echo "  - ดูสถานะ:    sudo systemctl status nextjs ngrok"
echo "  - ดู log:     journalctl -u nextjs -f"
echo "  - restart:    sudo systemctl restart nextjs"
echo ""
echo "URLs:"
echo "  - Local:  http://localhost:3001"
echo "  - ngrok:  ดูที่ http://localhost:4040"
echo ""

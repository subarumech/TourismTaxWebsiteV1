#!/bin/bash

# Universal Quick Deploy Script
# Works on Windows (Git Bash), macOS, and Linux
# Handles SSH keys and passwordless sudo intelligently

# Parse arguments
SKIP_CONFIRM=false
if [[ "$1" == "--yes" ]] || [[ "$1" == "-y" ]]; then
    SKIP_CONFIRM=true
fi

NAS_HOST="192.168.1.74"
NAS_USER="gravy23"
NAS_PROJECT_DIR="/volume1/docker/tdt-tax-collector"
DOCKER_COMPOSE="/usr/local/bin/docker-compose"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Universal Quick Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

detect_os() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*)
            echo "windows"
            ;;
        Darwin*)
            echo "macos"
            ;;
        Linux*)
            echo "linux"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

OS=$(detect_os)
echo -e "Detected OS: ${GREEN}$OS${NC}"
echo ""

check_ssh_key() {
    if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
        echo -e "${YELLOW}⚠ SSH key not found!${NC}"
        echo ""
        echo "To set up SSH key authentication (recommended):"
        echo "  1. Generate key: ssh-keygen -t ed25519 -N \"\" -f ~/.ssh/id_ed25519"
        echo "  2. Copy to NAS: ssh-copy-id ${NAS_USER}@${NAS_HOST}"
        echo ""
        read -p "Do you want to continue with password authentication? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        return 1
    fi
    return 0
}

check_ssh_connection() {
    echo "Testing SSH connection..."
    if ssh -o BatchMode=yes -o ConnectTimeout=5 ${NAS_USER}@${NAS_HOST} "echo 'Connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✓ SSH connection OK${NC}"
        return 0
    else
        echo -e "${RED}✗ SSH connection failed${NC}"
        echo ""
        echo "Please set up SSH key authentication:"
        echo "  ssh-copy-id ${NAS_USER}@${NAS_HOST}"
        echo ""
        exit 1
    fi
}

check_passwordless_sudo() {
    echo "Checking sudo configuration..."
    if ssh ${NAS_USER}@${NAS_HOST} "sudo -n true" 2>/dev/null; then
        echo -e "${GREEN}✓ Passwordless sudo configured${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Sudo requires password${NC}"
        echo ""
        echo "For fully automated deploys, configure passwordless sudo on NAS:"
        echo "  1. SSH to NAS: ssh ${NAS_USER}@${NAS_HOST}"
        echo "  2. Edit sudoers: sudo visudo"
        echo "  3. Add line: ${NAS_USER} ALL=(ALL) NOPASSWD: ${DOCKER_COMPOSE}"
        echo ""
        return 1
    fi
}

create_deployment_archive() {
    echo ""
    echo -e "${BLUE}Step 1: Creating deployment archive...${NC}"
    
    tar -czf deploy.tar.gz \
        --exclude='node_modules' \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='.git' \
        --exclude='*.db' \
        --exclude='data' \
        --exclude='instance' \
        --exclude='app' \
        --exclude='scripts' \
        --exclude='supabase' \
        --exclude='deploy.tar.gz' \
        --exclude='nas-docker.plan.md' \
        . 2>/dev/null
    
    echo -e "${GREEN}✓ Archive created${NC}"
}

transfer_files() {
    echo ""
    echo -e "${BLUE}Step 2: Transferring files to NAS...${NC}"
    
    cat deploy.tar.gz | ssh ${NAS_USER}@${NAS_HOST} "cat > /tmp/deploy.tar.gz"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Transfer failed!${NC}"
        rm -f deploy.tar.gz
        exit 1
    fi
    
    echo -e "${GREEN}✓ Files transferred${NC}"
}

extract_files() {
    echo ""
    echo -e "${BLUE}Step 3: Extracting files on NAS...${NC}"
    
    ssh ${NAS_USER}@${NAS_HOST} << 'EOF'
        cd /volume1/docker
        mkdir -p tdt-tax-collector
        cd tdt-tax-collector
        tar -xzf /tmp/deploy.tar.gz 2>/dev/null
        rm /tmp/deploy.tar.gz
EOF
    
    echo -e "${GREEN}✓ Files extracted${NC}"
    
    rm -f deploy.tar.gz
}

rebuild_container() {
    echo ""
    echo -e "${BLUE}Step 4: Rebuilding Docker container...${NC}"
    
    if ssh ${NAS_USER}@${NAS_HOST} "sudo -n true" 2>/dev/null; then
        ssh ${NAS_USER}@${NAS_HOST} "cd ${NAS_PROJECT_DIR} && sudo ${DOCKER_COMPOSE} down && sudo ${DOCKER_COMPOSE} up -d --build"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Container rebuilt successfully${NC}"
            return 0
        else
            echo -e "${RED}✗ Container rebuild failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Sudo requires password...${NC}"
        ssh -t ${NAS_USER}@${NAS_HOST} "cd ${NAS_PROJECT_DIR} && sudo ${DOCKER_COMPOSE} down && sudo ${DOCKER_COMPOSE} up -d --build"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Container rebuilt successfully${NC}"
            return 0
        else
            echo -e "${RED}✗ Container rebuild failed${NC}"
            return 1
        fi
    fi
}

check_env_file() {
    echo "Checking for .env file on NAS..."
    if ssh ${NAS_USER}@${NAS_HOST} "test -f ${NAS_PROJECT_DIR}/.env"; then
        echo -e "${GREEN}✓ .env file exists${NC}"
    else
        echo -e "${YELLOW}⚠ .env file not found on NAS${NC}"
        echo ""
        echo "Don't forget to create .env file with:"
        echo "  SUPABASE_URL=your_url"
        echo "  SUPABASE_ANON_KEY=your_key"
        echo "  GOOGLE_API_KEY=your_key"
        echo ""
    fi
}

main() {
    check_ssh_key || true
    check_ssh_connection || exit 1
    check_passwordless_sudo || true
    PASSWORDLESS_SUDO=$?
    check_env_file || true
    
    if [ "$SKIP_CONFIRM" = false ]; then
        echo ""
        read -p "Ready to deploy. Continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
    else
        echo ""
        echo -e "${GREEN}Auto-confirming deployment (--yes flag)${NC}"
    fi
    
    create_deployment_archive || exit 1
    transfer_files || exit 1
    extract_files || exit 1
    rebuild_container
    REBUILD_STATUS=$?
    
    if [ $REBUILD_STATUS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}Deployment completed successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "Your app should be running at: ${BLUE}http://${NAS_HOST}:3000${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}Deployment completed with errors${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
        echo "Check the logs on your NAS:"
        echo "  ssh ${NAS_USER}@${NAS_HOST}"
        echo "  cd ${NAS_PROJECT_DIR}"
        echo "  sudo docker-compose logs"
        echo ""
    fi
}

main


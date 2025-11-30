#!/bin/bash

NAS_HOST="192.168.1.74"
NAS_USER="gravy23"
NAS_PROJECT_DIR="/volume1/docker/tdt-tax-collector"
DOCKER_COMPOSE="/usr/local/bin/docker-compose"

echo "Quick Deploy to NAS"
echo ""

# Step 1: Create and transfer the archive
echo "Creating deployment archive..."
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

echo "Transferring files to NAS..."
cat deploy.tar.gz | ssh ${NAS_USER}@${NAS_HOST} "cat > /tmp/deploy.tar.gz"

if [ $? -ne 0 ]; then
  echo "Transfer failed!"
  rm -f deploy.tar.gz
  exit 1
fi

echo "Extracting files on NAS..."
ssh ${NAS_USER}@${NAS_HOST} << 'EOF'
  cd /volume1/docker
  mkdir -p tdt-tax-collector
  cd tdt-tax-collector
  tar -xzf /tmp/deploy.tar.gz 2>/dev/null
  rm /tmp/deploy.tar.gz
EOF

rm deploy.tar.gz

echo ""
echo "Files synced successfully!"
echo ""

# Check if we have a TTY for interactive sudo
if [ -t 0 ]; then
  echo "Rebuilding container (enter your sudo password when prompted)..."
  echo ""
  ssh -t ${NAS_USER}@${NAS_HOST} "cd ${NAS_PROJECT_DIR} && sudo ${DOCKER_COMPOSE} down && sudo ${DOCKER_COMPOSE} up -d --build"
  echo ""
  echo "Done! Your app should be running at http://${NAS_HOST}:3000"
else
  echo "No interactive terminal detected. To rebuild the container, run:"
  echo ""
  echo "  ssh ${NAS_USER}@${NAS_HOST}"
  echo "  cd ${NAS_PROJECT_DIR}"
  echo "  sudo ${DOCKER_COMPOSE} down && sudo ${DOCKER_COMPOSE} up -d --build"
  echo ""
  echo "Or run this script directly in your terminal (not piped)."
fi


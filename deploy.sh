#!/bin/bash

# Full deploy script - syncs files only
# For a full deploy with container rebuild, use quick-deploy.sh

NAS_HOST="192.168.1.74"
NAS_USER="gravy23"
NAS_PROJECT_DIR="/volume1/docker/tdt-tax-collector"
DOCKER_COMPOSE="/usr/local/bin/docker-compose"

echo "Deploying Tax Collector to NAS..."

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
  
  if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Create one with your Supabase credentials."
  fi
EOF

rm deploy.tar.gz

echo ""
echo "Files synced successfully!"
echo ""
echo "To rebuild the container, SSH into NAS and run:"
echo "  ssh ${NAS_USER}@${NAS_HOST}"
echo "  cd ${NAS_PROJECT_DIR}"
echo "  sudo ${DOCKER_COMPOSE} down && sudo ${DOCKER_COMPOSE} up -d --build"
echo ""
echo "Or use quick-deploy.sh in a terminal for an interactive deploy."


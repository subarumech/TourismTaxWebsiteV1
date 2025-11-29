#!/bin/bash

NAS_HOST="192.168.1.74"
NAS_USER="gravy23"
NAS_PROJECT_DIR="/volume1/docker/tdt-tax-collector"
PROJECT_NAME="tdt-tax-collector"

echo "🚀 Deploying Tax Collector to NAS..."

echo "📦 Creating deployment archive..."
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
  .

echo "📤 Transferring files to NAS..."
cat deploy.tar.gz | ssh ${NAS_USER}@${NAS_HOST} "cat > /tmp/deploy.tar.gz"

if [ $? -ne 0 ]; then
  echo "❌ Transfer failed. Trying alternative method..."
  ssh ${NAS_USER}@${NAS_HOST} "mkdir -p /tmp"
  cat deploy.tar.gz | ssh ${NAS_USER}@${NAS_HOST} "dd of=/tmp/deploy.tar.gz"
fi

echo "🔨 Extracting files on NAS..."
ssh ${NAS_USER}@${NAS_HOST} << 'EOF'
  cd /volume1/docker
  
  if [ ! -d "tdt-tax-collector" ]; then
    echo "Creating project directory..."
    mkdir -p tdt-tax-collector
  fi
  
  cd tdt-tax-collector
  
  tar -xzf /tmp/deploy.tar.gz
  rm /tmp/deploy.tar.gz
  
  if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your Supabase credentials."
    echo "Copy .env.example to .env and fill in your values."
  fi
EOF

echo "🔨 Building and restarting container..."
ssh -t ${NAS_USER}@${NAS_HOST} "cd /volume1/docker/tdt-tax-collector && sudo ./deploy-local.sh"

rm deploy.tar.gz

echo ""
echo "✨ Deploy finished! Your app should be running at:"
echo "   http://${NAS_HOST}:3000"
echo ""
echo "To check logs, SSH into your NAS and run:"
echo "   ssh ${NAS_USER}@${NAS_HOST}"
echo "   cd ${NAS_PROJECT_DIR} && docker-compose logs -f"


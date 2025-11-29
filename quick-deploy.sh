#!/bin/bash

echo "🚀 Quick Deploy to NAS"
echo ""

# Run the deploy script to sync files
./deploy.sh

# Then trigger the rebuild on NAS
echo ""
echo "🔨 Rebuilding container on NAS (you'll be prompted for your password)..."
ssh -t gravy23@192.168.1.74 "cd /volume1/docker/tdt-tax-collector && sudo ./deploy-local.sh"

echo ""
echo "✨ Done! Your app is running at http://192.168.1.74:3000"


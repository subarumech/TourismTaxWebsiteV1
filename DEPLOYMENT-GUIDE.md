# Self-Hosting Deployment Guide

Complete guide for hosting this application on a Synology NAS with external access via Cloudflare Tunnel.

## Architecture Overview

**Original Setup:**
- Frontend: Static HTML/CSS/JS
- Backend: Netlify serverless functions
- Database: Supabase (PostgreSQL)
- Hosting: Netlify

**New Self-Hosted Setup:**
- Frontend: Static HTML/CSS/JS (served by Express)
- Backend: Express.js server (replaces Netlify functions)
- Database: Supabase (unchanged - still cloud hosted)
- Container: Docker on Synology NAS
- External Access: Cloudflare Tunnel
- Domain: Custom domain with automatic HTTPS

## Part 1: NAS/Docker Setup

### Prerequisites
- Synology NAS with Container Manager (Docker) installed
- SSH access enabled on NAS
- Supabase account and database already set up

### Files Created

#### 1. `server.js`
Express.js server that:
- Serves static files from `public/` directory
- Implements all API routes (properties, payments, dealers, stats, sync)
- Connects directly to Supabase using environment variables
- Runs on port 3000

#### 2. `Dockerfile`
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

#### 3. `docker-compose.yml`
Orchestrates the container with environment variables:
```yaml
version: '3.8'
services:
  tdt-app:
    build: .
    container_name: tdt-tax-collector
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
```

#### 4. `.dockerignore`
Excludes unnecessary files from Docker image:
- Python app files
- Data files
- Git files
- Virtual environments
- Local databases

### Initial NAS Setup

1. **SSH into NAS:**
   ```bash
   ssh your-user@192.168.1.74
   ```

2. **Create project directory:**
   ```bash
   mkdir -p /volume1/docker/tdt-tax-collector
   cd /volume1/docker/tdt-tax-collector
   ```

3. **Create `.env` file:**
   ```bash
   cat > .env << 'EOF'
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   GOOGLE_API_KEY=your-google-api-key (optional)
   PORT=3000
   EOF
   ```

4. **Add user to docker group (if needed):**
   ```bash
   sudo synogroup --add docker your-user
   ```
   Note: This may not work on all Synology systems. If Docker commands require sudo, that's normal.

### Docker Permissions Note

On Synology NAS, you may need to use `sudo` for docker commands. This is normal and secure when limited to specific commands.

## Part 2: Deployment Process

### Deployment Scripts

#### Local: `deploy.sh`
Syncs code from development machine to NAS:
- Creates tar archive (excludes unnecessary files)
- Transfers via SSH to NAS `/tmp` directory
- Extracts files on NAS
- Uses `gravy23` as SSH user (update to your username)

#### Local: `quick-deploy.sh`
One-command deployment:
```bash
./quick-deploy.sh
```
This runs `deploy.sh` then triggers rebuild on NAS.

#### NAS: `deploy-local.sh`
Located at `/volume1/docker/tdt-tax-collector/deploy-local.sh`
Handles Docker rebuild:
```bash
#!/bin/bash
cd /volume1/docker/tdt-tax-collector
echo '🔄 Stopping existing container...'
docker-compose down
echo '🔨 Building new image...'
docker-compose build
echo '🚀 Starting container...'
docker-compose up -d
echo ''
echo '✅ Deployment complete!'
docker-compose ps
```

### Deploying Updates

**Important:** The Cloudflare Tunnel and Docker container are **separate processes**. The tunnel runs continuously in the background and forwards traffic to your Docker container. When you deploy updates, you're only rebuilding the Docker container - the tunnel keeps running and doesn't need to be touched.

```
Internet → Cloudflare Tunnel (always running) → localhost:3000 → Docker Container (gets rebuilt)
```

**Method 1: Quick Deploy (Recommended)**
```bash
./quick-deploy.sh
```
Prompts for NAS password once, handles everything. The tunnel stays running during deployment.

**Method 2: Manual Deploy**
```bash
# From your Mac
./deploy.sh

# Then SSH into NAS
ssh your-user@192.168.1.74
cd /volume1/docker/tdt-tax-collector
sudo ./deploy-local.sh
```

**Method 3: SSH and Manual Commands**
```bash
ssh your-user@192.168.1.74
cd /volume1/docker/tdt-tax-collector
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d
```

### Managing the Container

**View logs:**
```bash
ssh your-user@192.168.1.74
cd /volume1/docker/tdt-tax-collector
sudo docker-compose logs -f
```

**Restart:**
```bash
sudo docker-compose restart
```

**Stop:**
```bash
sudo docker-compose down
```

**Check status:**
```bash
sudo docker-compose ps
```

## Part 3: Cloudflare Tunnel Setup

### Why Cloudflare Tunnel?

**Benefits:**
- No port forwarding required (more secure)
- No firewall configuration needed
- Works even if ISP blocks ports
- Free automatic HTTPS/SSL certificates
- Built-in DDoS protection
- Professional CDN
- No exposed ports on your home network

### Prerequisites

1. Domain registered (can buy through Cloudflare or elsewhere)
2. Domain added to Cloudflare (free plan is fine)
3. Cloudflare account created

### Installation Steps

#### 1. Install cloudflared on NAS

```bash
ssh your-user@192.168.1.74
cd ~
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
cloudflared --version
```

#### 2. Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser URL. Visit it, log into Cloudflare, select your domain, and authorize.

A certificate is saved to `~/.cloudflared/cert.pem`.

#### 3. Create the Tunnel

```bash
cloudflared tunnel create your-tunnel-name
```

**Important:** Save the Tunnel ID shown (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

This creates `~/.cloudflared/{TUNNEL_ID}.json` with credentials.

#### 4. Copy Credentials to System Location

Because the tunnel runs as root, it needs credentials in a system directory:

```bash
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/cert.pem /etc/cloudflared/
sudo cp ~/.cloudflared/{TUNNEL_ID}.json /etc/cloudflared/
```

Replace `{TUNNEL_ID}` with your actual tunnel ID.

#### 5. Create Configuration File

```bash
cat > /tmp/cloudflared-config.yml << 'EOF'
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: /etc/cloudflared/YOUR_TUNNEL_ID_HERE.json
origincert: /etc/cloudflared/cert.pem

ingress:
  - hostname: your-domain.com
    service: http://localhost:3000
  - hostname: www.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
EOF
```

Replace:
- `YOUR_TUNNEL_ID_HERE` with your tunnel ID (2 places)
- `your-domain.com` with your actual domain

Move to system location:
```bash
sudo mv /tmp/cloudflared-config.yml /etc/cloudflared/config.yml
sudo chmod 644 /etc/cloudflared/config.yml
```

#### 6. Route DNS to Tunnel

```bash
cloudflared tunnel route dns your-tunnel-name your-domain.com
cloudflared tunnel route dns your-tunnel-name www.your-domain.com
```

This automatically creates CNAME records in Cloudflare DNS pointing to your tunnel.

#### 7. Test the Tunnel

```bash
sudo cloudflared tunnel --config /etc/cloudflared/config.yml run your-tunnel-name
```

Open `https://your-domain.com` in a browser. Your app should load with automatic HTTPS!

If it works, press `Ctrl+C` to stop the test.

#### 8. Set Up Auto-Start

Create startup script at `/usr/local/etc/rc.d/cloudflared.sh`:

```bash
sudo vi /usr/local/etc/rc.d/cloudflared.sh
```

Add:
```bash
#!/bin/sh
case $1 in
  start)
    /usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run your-tunnel-name &
    ;;
  stop)
    killall cloudflared
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    exit 1
    ;;
esac
```

Make executable and start:
```bash
sudo chmod +x /usr/local/etc/rc.d/cloudflared.sh
sudo /usr/local/etc/rc.d/cloudflared.sh start
```

Verify it's running:
```bash
ps aux | grep cloudflared
```

### Managing Cloudflare Tunnel

**Important:** You rarely need to manage the tunnel after initial setup. It runs continuously and automatically forwards traffic to your Docker container. The deployment process (`quick-deploy.sh`) rebuilds your app without touching the tunnel.

**When You DO Need to Manage the Tunnel:**
- After NAS reboot (check if auto-started)
- Changing domains or ports
- Troubleshooting connectivity issues
- Tunnel process crashes

**Start:**
```bash
sudo /usr/local/etc/rc.d/cloudflared.sh start
```

**Stop:**
```bash
sudo /usr/local/etc/rc.d/cloudflared.sh stop
```

**Restart:**
```bash
sudo /usr/local/etc/rc.d/cloudflared.sh stop
sudo /usr/local/etc/rc.d/cloudflared.sh start
```

**View logs (if running in foreground):**
```bash
sudo cloudflared tunnel --config /etc/cloudflared/config.yml run your-tunnel-name
```

**Check if running:**
```bash
ps aux | grep cloudflared | grep -v grep
```
Should show the cloudflared process. If nothing shows, the tunnel is not running.

## Troubleshooting

### Common Issues and Solutions

#### 1. "Permission denied" with docker commands
**Solution:** Use `sudo` with docker commands on Synology. This is normal and secure.

#### 2. "Permission denied" reading config file
**Solution:** 
```bash
sudo chmod 644 /etc/cloudflared/config.yml
```

#### 3. "Cannot find origin cert" with cloudflared
**Solution:** Make sure cert files are in `/etc/cloudflared/`:
```bash
sudo cp ~/.cloudflared/cert.pem /etc/cloudflared/
sudo cp ~/.cloudflared/{TUNNEL_ID}.json /etc/cloudflared/
```
Update config to use `/etc/cloudflared/` paths.

#### 4. Tunnel connects but returns 503 errors
**Solution:** Check that your Docker container is running:
```bash
sudo docker-compose ps
```
Make sure the app is accessible at `http://localhost:3000` from the NAS.

#### 5. Deploy script asks for password multiple times
**Solution:** This is expected behavior when using `sudo` commands. For passwordless deployment, consider setting up SSH keys and sudo permissions, though requiring password is more secure.

#### 6. Container won't start after reboot
**Solution:** 
- Restart Docker container: `sudo docker-compose up -d`
- Restart Cloudflare tunnel: `sudo /usr/local/etc/rc.d/cloudflared.sh start`

#### 7. "tar: Ignoring unknown extended header keyword" warnings
**Solution:** These warnings are harmless. They're from macOS file attributes (Google Drive metadata) that Linux tar doesn't understand. The files still extract correctly.

#### 8. Dashboard not loading data or "Sync failed: The string did not match the expected pattern"
**Solution:** This is usually a Supabase RLS (Row Level Security) policy issue:
1. Make sure `.env` file on NAS has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. In Supabase SQL Editor, run these SQL files in order:
   - `supabase/schema.sql` (creates tables and basic policies)
   - `supabase/add_insert_policies.sql` (adds insert policies for county data)
   - `supabase/fix_missing_policies.sql` (adds missing dealer insert policy)
3. Restart the Docker container: `sudo docker-compose restart`
4. Clear browser cache and reload the dashboard

### Health Check Commands

**Check web server:**
```bash
curl http://localhost:3000
```
Should return HTML.

**Check from outside:**
```bash
curl https://your-domain.com
```
Should return your app's homepage.

**Check Docker container:**
```bash
sudo docker-compose ps
```
Should show container as "Up".

**Check Cloudflare tunnel:**
```bash
ps aux | grep cloudflared
```
Should show cloudflared process running.

## Environment Variables

### Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `PORT` - Port to run on (default: 3000)

### Optional
- `GOOGLE_API_KEY` - For Google Maps integration and sync features
- `NODE_ENV` - Set to "production" for production deployments

## Security Notes

1. **Environment Variables:** Never commit `.env` file to git. Keep credentials secure.

2. **Cloudflare Tunnel:** More secure than port forwarding - no ports exposed on your network.

3. **Sudo Access:** Using sudo for Docker commands is normal on Synology. You can limit this to specific commands only if desired.

4. **HTTPS:** Cloudflare automatically provides SSL/TLS certificates. All traffic is encrypted.

5. **Database:** Supabase handles database security, backups, and access control. Your NAS only hosts the web frontend/API layer.

## Architecture Benefits

**Separation of Concerns:**
- NAS: Web application (stateless, can be rebuilt anytime)
- Supabase: Database (persistent, backed up, managed)
- Cloudflare: Edge network, SSL, DDoS protection

**Easy Updates:**
- Run `./quick-deploy.sh` to deploy code changes
- Data is never at risk since it's in Supabase
- Container can be destroyed and rebuilt without data loss

**Cost:**
- NAS: One-time hardware cost, no monthly fees
- Supabase: Free tier generous, or ~$25/month for pro
- Cloudflare: Free for tunnel and DNS
- Domain: ~$10-15/year
- Total: Essentially free after initial setup!

## Understanding the System Components

### Three Independent Layers

1. **Database Layer** (Supabase)
   - Runs in the cloud, managed by Supabase
   - Never needs to be restarted or managed
   - Contains all your data

2. **Application Layer** (Docker Container)
   - Runs on your NAS on port 3000
   - Gets rebuilt when you deploy updates
   - Stateless - can be destroyed and rebuilt anytime
   - Managed with: `sudo docker-compose restart`

3. **Tunnel Layer** (Cloudflare)
   - Runs on your NAS as a background process
   - Forwards https://your-domain.com to localhost:3000
   - Set up once, runs continuously
   - Independent of Docker container
   - Managed with: `sudo /usr/local/etc/rc.d/cloudflared.sh start|stop`

### What Happens When You Deploy

```bash
./quick-deploy.sh
```

1. ✅ Transfers new code to NAS
2. ✅ Stops Docker container
3. ✅ Rebuilds Docker image with new code
4. ✅ Starts Docker container
5. ⏸️ Cloudflare Tunnel: **No action needed** - keeps running, automatically reconnects to container
6. ⏸️ Supabase Database: **No action needed** - unchanged

**Result:** Your site is updated with new code. Brief ~10 second downtime while container rebuilds.

## Quick Reference

### URLs
- **Local:** http://192.168.1.74:3000
- **Public:** https://your-domain.com
- **Alt:** https://www.your-domain.com

### Key Locations on NAS
- **App Directory:** `/volume1/docker/tdt-tax-collector/`
- **Environment File:** `/volume1/docker/tdt-tax-collector/.env`
- **Cloudflared Config:** `/etc/cloudflared/config.yml`
- **Cloudflared Certs:** `/etc/cloudflared/cert.pem` and `{TUNNEL_ID}.json`
- **Startup Script:** `/usr/local/etc/rc.d/cloudflared.sh`

### Key Commands

**Deploy:**
```bash
./quick-deploy.sh
```

**Restart App:**
```bash
ssh user@nas "cd /volume1/docker/tdt-tax-collector && sudo docker-compose restart"
```

**View Logs:**
```bash
ssh user@nas "cd /volume1/docker/tdt-tax-collector && sudo docker-compose logs -f"
```

**Restart Tunnel:**
```bash
ssh user@nas "sudo /usr/local/etc/rc.d/cloudflared.sh stop && sudo /usr/local/etc/rc.d/cloudflared.sh start"
```

---

## Example: Complete Setup from Scratch

If you needed to set this up on a new NAS:

1. Install Container Manager on Synology
2. Enable SSH access
3. SSH in and create `/volume1/docker/tdt-tax-collector/.env` with credentials
4. Run `./quick-deploy.sh` from your Mac (transfers and builds everything)
5. Install cloudflared on NAS
6. Run `cloudflared tunnel login` and authenticate
7. Create tunnel: `cloudflared tunnel create name`
8. Copy certs to `/etc/cloudflared/`
9. Create config at `/etc/cloudflared/config.yml`
10. Route DNS: `cloudflared tunnel route dns name domain.com`
11. Create startup script at `/usr/local/etc/rc.d/cloudflared.sh`
12. Start tunnel: `sudo /usr/local/etc/rc.d/cloudflared.sh start`
13. Done! Visit https://domain.com

Total time: ~30 minutes


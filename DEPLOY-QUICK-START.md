# Quick Start - Deployment

One-command deployment for all platforms.

## 🚀 Deploy Now (Universal Command)

The deployment system automatically detects your platform and uses the right tools.

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Windows (Git Bash) or macOS / Linux
```bash
./deploy
```

**That's it!** Same command structure on every platform.

## ⚙️ First Time Setup (One Time Only)

### 1. SSH Key Setup
```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
ssh-copy-id gravy23@192.168.1.74
```

### 2. Optional - Passwordless Sudo (Recommended)
For fully automated deploys without password prompts:

```bash
# SSH to NAS
ssh gravy23@192.168.1.74

# Edit sudoers file
sudo visudo

# Add this line at the end:
gravy23 ALL=(ALL) NOPASSWD: /usr/local/bin/docker-compose

# Save and exit (Ctrl+X, Y, Enter)
```

### 3. Create .env file on NAS
```bash
ssh gravy23@192.168.1.74
cd /volume1/docker/tdt-tax-collector
nano .env
```

Add:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
GOOGLE_API_KEY=your-key-here
PORT=3000
NODE_ENV=production
```

## ✅ After Setup

Once setup is complete, deploying is just one command:

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Mac/Linux or Windows (Git Bash):**
```bash
./deploy
```

No passwords, no manual steps, fully automated! 🎉

## 🔧 What It Does

1. ✅ Detects your OS automatically
2. ✅ Creates deployment archive (excludes unnecessary files)
3. ✅ Transfers files to NAS via SSH
4. ✅ Extracts files on NAS
5. ✅ Stops old Docker container
6. ✅ Rebuilds Docker image with new code
7. ✅ Starts new container
8. ✅ Shows you the URL: http://192.168.1.74:3000

## ❓ Troubleshooting

**"SSH connection failed"**
- Run: `ssh-copy-id gravy23@192.168.1.74`

**"Sudo requires password"**
- Either enter password when prompted, OR
- Set up passwordless sudo (see step 2 above)

**"Git Bash not found" (Windows)**
- Install Git for Windows: https://git-scm.com/download/win

**Container not starting**
- Check logs: `ssh gravy23@192.168.1.74 "cd /volume1/docker/tdt-tax-collector && docker-compose logs"`

## 📚 Full Documentation

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for complete details.


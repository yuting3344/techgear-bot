#!/usr/bin/env bash
# SSH tunnel to remote Ollama server
# Usage: SSH_USER=ubuntu SSH_HOST=your-server.com bash scripts/tunnel.sh
#
# The server must have this public key in ~/.ssh/authorized_keys:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHE0ylF9V16kp9hOCD2MTlMVR6puEJlbuhVe9F9l+wKI

SSH_USER="${SSH_USER:?Set SSH_USER to your remote server username}"
SSH_HOST="${SSH_HOST:?Set SSH_HOST to your remote server hostname or IP}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_ed25519}"
LOCAL_PORT="${LOCAL_PORT:-11434}"
REMOTE_PORT="${REMOTE_PORT:-11434}"

echo "Establishing SSH tunnel: localhost:$LOCAL_PORT -> $SSH_HOST:$REMOTE_PORT"
ssh -N -L "$LOCAL_PORT:localhost:$REMOTE_PORT" \
    -i "$SSH_KEY" \
    -o StrictHostKeyChecking=accept-new \
    "$SSH_USER@$SSH_HOST"

#!/bin/sh
# scripts/setup-dev-env.sh
#
# One-time setup for Socket CLI security scanning on webui-vue.
# Safe to re-run — every step is idempotent.

set -e

echo "=== Socket CLI dev environment setup ==="

# 1. Install Socket CLI if missing
if ! command -v socket >/dev/null 2>&1; then
    echo "Installing Socket CLI..."
    npm install -g @socketsecurity/cli
else
    echo "Socket CLI already installed, skipping."
fi

# 2. Add npm/npx wrapper aliases to shell rc files
for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$rc" ]; then
        grep -qxF 'alias npm="socket npm"' "$rc" || {
          echo 'alias npm="socket npm"' >> "$rc"
          echo "Added npm alias to $rc"
        }
        grep -qxF 'alias npx="socket npx"' "$rc" || {
          echo 'alias npx="socket npx"' >> "$rc"
          echo "Added npx alias to $rc"
        }
    fi
done

# 3. Scaffold a personal token file (outside the repo, never committed)
SOCKET_ENV="$HOME/.socket_env"
if [ ! -f "$SOCKET_ENV" ]; then
    cat > "$SOCKET_ENV" << 'EOF'
# Personal Socket CLI token — do not commit this file
export SOCKET_CLI_API_TOKEN="your-token-here"
EOF
    chmod 600 "$SOCKET_ENV"
    echo ""
    echo "Created $SOCKET_ENV"
    echo "  -> Edit it and add your real Socket API token (get one at https://socket.dev)"
else
    echo "$SOCKET_ENV already exists, skipping."
fi

# 4. Install the pre-commit hook into this clone
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
    echo "Not inside a git repo — skipping hook install."
    REPO_ROOT=""
}

if [ -n "$REPO_ROOT" ]; then
    HOOK_DIR=$(git rev-parse --git-dir)/hooks
    HOOK_FILE="$HOOK_DIR/pre-commit"

    cat > "$HOOK_FILE" << 'EOF'
#!/bin/sh
# pre-commit — runs Socket scan when staged changes touch dependency files

# Load token explicitly — hooks run non-interactively and won't read .bashrc
[ -f "$HOME/.socket_env" ] && . "$HOME/.socket_env"

if [ -z "$SOCKET_CLI_API_TOKEN" ]; then
  echo "Warning: SOCKET_CLI_API_TOKEN not set — see ~/.socket_env"
fi

if git diff --cached --name-only | grep -qE 'package(-lock)?\.json$'; then
  echo "Dependency files staged — running Socket check..."
  socket ci
  if [ $? -ne 0 ]; then
    echo "Socket scan failed — fix before committing."
    exit 1
  fi
fi
EOF
    chmod +x "$HOOK_FILE"
    echo "Installed pre-commit hook at $HOOK_FILE"
fi

# 5. Create local scan output directory and keep it out of git
mkdir -p .socket
grep -qxF '.socket/' .gitignore 2>/dev/null || echo '.socket/' >> .gitignore

echo ""
echo "=== Setup complete ==="
echo "1. Edit $SOCKET_ENV and add your real Socket API token"
echo "2. Restart your shell or run: source ~/.bashrc (or ~/.zshrc)"
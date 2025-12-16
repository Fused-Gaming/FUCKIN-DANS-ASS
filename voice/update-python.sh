#!/usr/bin/env bash
set -euo pipefail

log() { printf '["%s"] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

detect_os() {
  if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    echo "${ID:-unknown}"
  else
    echo "unknown"
  fi
}

ensure_wsl() {
  if grep -qi "microsoft" /proc/version 2>/dev/null; then
    return 0
  fi
  fail "This script is intended to run inside WSL. Launch it via 'wsl' from Git Bash."
}

main() {
  ensure_wsl
  require_cmd curl
  require_cmd tar

  OS_ID="$(detect_os)"
  log "Detected OS: ${OS_ID} (WSL)"

  case "$OS_ID" in
    ubuntu|debian)
      require_cmd sudo
      log "Updating apt metadata..."
      sudo apt-get update -y

      log "Installing build deps..."
      sudo apt-get install -y --no-install-recommends \
        build-essential libssl-dev zlib1g-dev libbz2-dev \
        libreadline-dev libsqlite3-dev wget llvm libncurses5-dev \
        libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev \
        python3-distutils ca-certificates

      PY_VER="$(curl -fsSL https://www.python.org/ftp/python/ | \
        grep -Eo 'href="[0-9]+\.[0-9]+\.[0-9]+/' | \
        sed 's#href="##;s#/##' | sort -V | tail -1)" || fail "Could not fetch latest Python version"
      log "Latest Python version: ${PY_VER}"

      TMPDIR="$(mktemp -d)"
      cleanup() { rm -rf "$TMPDIR"; }
      trap cleanup EXIT

      cd "$TMPDIR"
      log "Downloading Python ${PY_VER}..."
      curl -fsSLO "https://www.python.org/ftp/python/${PY_VER}/Python-${PY_VER}.tgz"

      log "Extracting..."
      tar -xf "Python-${PY_VER}.tgz"
      cd "Python-${PY_VER}"

      log "Configuring..."
      ./configure --enable-optimizations --with-ensurepip=install || fail "Configure failed"

      log "Building (this may take a while)..."
      make -j"$(nproc)" || fail "Build failed"

      log "Installing with altinstall to avoid clobbering system python..."
      sudo make altinstall || fail "Install failed"

      log "Verifying installed version (ignoring env with -E)..."
      "python${PY_VER%.*}" -E -VV || fail "Verification failed"

      log "Done. You can run: python${PY_VER%.*} -E -m pip list"
      ;;
    fedora|rhel|centos)
      fail "Add instructions for your distro (dnf/yum) before running."
      ;;
    *)
      fail "Unsupported or undetected OS. Please adjust script for your platform."
      ;;
  esac
}

main "$@"

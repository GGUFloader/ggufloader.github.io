---
title: "Installation Guide"
description: "Complete guide to installing GGUF Loader on Windows, macOS, and Linux"
permalink: /docs/installation/
layout: docs
toc: true
tags: ["installation", "setup", "getting-started", "Windows", "macOS", "Linux"]
related_docs: ["quick-start", "troubleshooting", "user-guide"]
difficulty: "beginner"
reading_time: "5 minutes"
---

# Installation Guide

This guide will help you install GGUF Loader 2.1.2 on your system. Want to see what GGUF Loader can do first? [Explore the features on our homepage](/#features "See GGUF Loader's powerful features in action").

## 📋 System Requirements

- **OS**: Windows 10/11, Linux (x86_64), or macOS
- **RAM**: 4 GB minimum (8 GB+ recommended for larger models)
- **Storage**: 2 GB free space for the app, plus room for model files
- **GPU**: Optional — CPU-only works everywhere; NVIDIA CUDA is supported on Windows and Linux
- **Python**: Not required for the installers (everything is bundled)

## 🚀 Quick Installation

The prebuilt installers bundle Python, PySide6, and llama.cpp — you do **not** need Python installed.

### Windows

1. Download **[GGUFLoader_v2.1.2.exe](https://github.com/GGUFloader/gguf-loader/releases/download/v2.1.2/GGUFLoader_v2.1.2.exe)** (~61 MB) from the [releases page](https://github.com/GGUFloader/gguf-loader/releases).
2. Double-click the downloaded file and run it. No installation wizard — the app starts immediately.

> ⚠️ **Windows SmartScreen**: The first launch may show "Windows protected your PC". Click **More info** → **Run anyway**. This is normal for unsigned open-source binaries.

### Linux (x86_64)

1. Download **[GGUFLoader_v2.1.2_linux_x86_64.tar.gz](https://github.com/GGUFloader/gguf-loader/releases/download/v2.1.2/GGUFLoader_v2.1.2_linux_x86_64.tar.gz)** (~90 MB).
2. Extract and install:
   ```bash
   tar -xzf GGUFLoader_v2.1.2_linux_x86_64.tar.gz
   cd GGUFLoader-v2.1.2-linux
   ./install.sh              # per-user install, no root needed
   ```
3. Launch from your app menu, or run `gguf-loader` in a terminal.

The installer also supports:
- `./install.sh --system` — system-wide install to `/opt` (prompts via sudo)
- `./install.sh --uninstall` — remove the per-user install cleanly
- `./install.sh --help` — show usage

A raw binary ([GGUFLoader_v2.1.2_linux_x86_64](https://github.com/GGUFloader/gguf-loader/releases/download/v2.1.2/GGUFLoader_v2.1.2_linux_x86_64)) is also available if you prefer to run it directly.

### macOS

No prebuilt installer is published yet. Run from source (below) — everything works on macOS.

### Run from Source (any platform)

For development, or to run on an unsupported platform:

```bash
git clone https://github.com/GGUFloader/gguf-loader.git
cd gguf-loader
pip install -r requirements.txt
python main.py
```

## ✅ Verify Your Installation

Run `GGUFLoader_v2.1.2.exe --version` (Windows) or `./GGUFLoader_v2.1.2_linux_x86_64 --version` (Linux) — it prints `GGUF Loader version 2.1.2` and exits.

## 🔧 Next Steps

- [Quick Start Guide](/docs/quick-start/) — load your first model
- [Troubleshooting](/docs/troubleshooting/) — if something isn't working

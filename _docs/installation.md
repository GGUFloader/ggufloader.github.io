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

This guide will help you install GGUF Loader 2.2.0 on your system. Want to see what GGUF Loader can do first? [Explore the features on our homepage](/#features "See GGUF Loader's powerful features in action").

## 📋 System Requirements

- **OS**: Windows 10/11, Linux (x86_64), or macOS
- **RAM**: 4 GB minimum (8 GB+ recommended for larger models)
- **Storage**: 2 GB free space for the app, plus room for model files
- **GPU**: Optional — CPU-only works everywhere; NVIDIA CUDA is supported on Windows and Linux
- **Python**: Not required for the installers (everything is bundled)

## 🚀 Quick Installation

The prebuilt installers bundle Python, PySide6, and llama.cpp — you do **not** need Python installed.

### Windows

1. Download **[GGUFLoader_v2.2.0_CPU.exe](https://github.com/GGUFloader/gguf-loader/releases/download/v2.2.0/GGUFLoader_v2.2.0_CPU.exe)** (~69 MB) from the [releases page](https://github.com/GGUFloader/gguf-loader/releases). This is the CPU-only build that works on any PC.
2. Have an NVIDIA GPU with CUDA? Grab **[GGUFLoader_v2.2.0_GPU.exe](https://github.com/GGUFloader/gguf-loader/releases/download/v2.2.0/GGUFLoader_v2.2.0_GPU.exe)** (~854 MB) instead for GPU acceleration.
3. Double-click the downloaded file and run it. No installation wizard — the app starts immediately.

> ⚠️ **Windows SmartScreen**: The first launch may show "Windows protected your PC". Click **More info** → **Run anyway**. This is normal for unsigned open-source binaries.

### Linux (x86_64)

1. Download **[GGUFLoader_v2.2.0_linux_x86_64_CPU](https://github.com/GGUFloader/gguf-loader/releases/download/v2.2.0/GGUFLoader_v2.2.0_linux_x86_64_CPU)** (~121 MB) from the [releases page](https://github.com/GGUFloader/gguf-loader/releases).
2. Make it executable and run:
   ```bash
   chmod +x GGUFLoader_v2.2.0_linux_x86_64_CPU
   ./GGUFLoader_v2.2.0_linux_x86_64_CPU
   ```
No installation needed — the app starts directly. Everything (Python, PySide6, llama.cpp) is bundled.

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

Run `GGUFLoader_v2.2.0_CPU.exe --version` (Windows) or `./GGUFLoader_v2.2.0_linux_x86_64_CPU --version` (Linux) — it prints `GGUF Loader version 2.2.0` and exits.

## 🔧 Next Steps

- [Quick Start Guide](/docs/quick-start/) — load your first model
- [Troubleshooting](/docs/troubleshooting/) — if something isn't working

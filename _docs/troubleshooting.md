---
title: "Troubleshooting Guide"
description: "Solutions to common GGUF Loader issues and problems"
permalink: /docs/troubleshooting/
layout: docs
toc: true
tags: ["troubleshooting", "help", "issues", "problems", "solutions"]
related_docs: ["installation", "user-guide", "quick-start"]
difficulty: "beginner"
reading_time: "10 minutes"
---

# Troubleshooting Guide

Common issues and their fixes. Running the app from a terminal (`python main.py` or the installed binary) shows the console log, which is the fastest way to diagnose most problems.

## 🚀 App Won't Start

### Windows SmartScreen blocks the .exe
- Click **More info → Run anyway**. The binaries are unsigned open-source builds; this is expected.

### "llama-cpp-python is required but not installed"
- The llama.cpp runtime is missing. In the app's **Environment** section click **Install Missing Dependencies**, or from source: `pip install -r requirements.txt`.

### DLL load errors on Windows (`ImportError: DLL load failed`)
- The bundled `llama_cpp/lib` wasn't found. Make sure you're running the full package (not just copying a single file), and check the console log for `Added Windows DLL directory: ...`.

## 🧠 Model Won't Load

### "Failed to load model" / unknown format
- Confirm the file is a real GGUF file (`.gguf`). Corrupted or partial downloads fail; re-download the file.
- Check the file has enough disk space and isn't on a network drive with strict permissions.

### Out of memory / crashes when loading
- Reduce **Context Length** (try 4096 or 8192).
- Switch **Processing** to `CPU Only` if GPU mode crashes (VRAM exhaustion).
- Use a smaller quantized model (Q4_0/Q4_K_M instead of Q8).

### GPU Accelerated is slow or doesn't use the GPU
- GPU mode requires a CUDA-enabled `llama-cpp-python` build. Verify with `scripts/verify_gpu_support.py` or run `scripts/install_gpu_llama.bat`/`.sh` (see the [Installation Guide](/docs/installation/)).
- On Linux, make sure the NVIDIA driver and CUDA toolkit are installed.

## 💬 Chat Problems

### Send button is disabled
- No model is loaded. Load a `.gguf` model first.

### Responses are empty or garbled
- Some models need specific prompt formats. Check the model card for a chat template; very small models also produce weak output.
- Lower `temperature`-style randomness isn't exposed per-chat — try a different preset or model.

### Chat is slow
- Smaller context, CPU-only on fast threads, and a smaller quantized model all help. Generation speed is dominated by model size and hardware.

## 🤖 Agent Mode Issues

### "Please load a model first"
- Agent Mode needs a loaded model — load one, then toggle Agent Mode on.

### Agent can't find files / "Path escapes workspace"
- The agent is **sandboxed to the workspace folder**. Put files you want it to touch inside the workspace, or choose the right folder with the 📁 button.

### Agent stuck on "Processing..."
- Generation is single-threaded; long tool chains take time. Watch the status messages for progress.

## 💬 Floating Chat Addon

### Button doesn't float above other apps on Linux
- This is expected under **Wayland** — compositors confine app windows to the app itself. Run under an X11 session or with `QT_QPA_PLATFORM=xcb` for full always-on-top behavior.

### Button disappears when switching apps on macOS
- Fixed in 2.1.2 (the `Tool` flag is now dropped on macOS so the button stays visible). If it still happens, check the console log and confirm the addon is listed under **Addons**.

### Button is stuck minimized
- Fixed in 2.1.2 — the button now restores itself immediately if a system shortcut minimizes it.

### Addon not in the Addons menu
- Click **Addons → Refresh Addons**, or restart the app. Check the console for `Failed to load addon ...`.

## 🪟 Window / Layout Problems

### Window too small / layout broken
- The minimum window size is 800×500. Maximize or resize the splitter — the sidebar is collapsible via the splitter handle.

### Wrong colors / theme looks off
- **View → Dark Mode** toggles themes. If colors look broken after a theme change, restart the app.

## 🐍 Environment / venv Issues

### "Not running from .venv"
- The app detected the system Python. Click **Create .venv & Restart** in the sidebar to bootstrap an isolated environment.

### pip install fails with externally-managed-environment (Linux)
- On Debian/Ubuntu 24.04+ the system Python blocks pip. Use the app's **Create .venv & Restart**, or create a venv manually:
  ```bash
  python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
  ```

## 📁 Where to Find Logs

- **Windows**: `%LOCALAPPDATA%\GGUFLoader\logs`
- **Linux/macOS**: `~/.ggufloader/logs`

Include the relevant log excerpt when [opening an issue](https://github.com/GGUFloader/gguf-loader/issues).

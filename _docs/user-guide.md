---
title: "User Guide"
description: "Complete user manual for GGUF Loader - learn all features and capabilities"
permalink: /docs/user-guide/
layout: docs
toc: true
tags: ["user-guide", "manual", "features", "usage", "tutorial"]
related_docs: ["quick-start", "installation", "troubleshooting"]
difficulty: "beginner"
reading_time: "15 minutes"
---

# User Guide

This is the complete manual for GGUF Loader 2.1.2. GGUF Loader is a privacy-first desktop app for running large language models locally from GGUF files, with zero data leaving your machine.

## 🪟 The Main Window

The app is divided into three areas:

1. **Header bar** (top) — brand on the left, a live **model status chip** on the right.
2. **Sidebar** (left) — Model Settings, Environment, and Launcher sections.
3. **Chat area** (center) — the conversation, or a welcome screen when no model is loaded.

## ⚙️ Model Settings Sidebar

### Model
- **Load GGUF Model** — opens a file dialog; pick any `.gguf` file.
- **Model info** — shows the loaded file name (or an error).

### Processing
- **CPU Only** — runs on any machine using llama.cpp's CPU backend.
- **GPU Accelerated** — offloads layers to an NVIDIA GPU (Windows/Linux). Requires a working CUDA llama-cpp-python install.

### Context Length
The model's context window in tokens (512–32768). Larger contexts use more RAM. Change it before loading a model.

## 📊 Environment Section

GGUF Loader ships with a built-in dependency manager for source installs:

- **Python · .venv status** — shows the interpreter and whether the app runs from a virtual environment.
- **Install Missing Dependencies** — appears when packages are missing; runs `pip install -r requirements.txt`.
- **Create .venv & Restart** — bootstraps a virtual environment and relaunches inside it.
- **Check Again** — re-scans the environment.

> The packaged installers (`.exe` / Linux tarball) bundle everything, so this section is mostly relevant when running from source.

## 🚀 Launcher Section

One-click buttons that open the project's `scripts/` utilities (e.g. GPU support verification, monitor) in separate windows, plus **Restart App**.

## 💬 Chatting

- Type in the input box; **Enter** sends, **Shift+Enter** inserts a newline.
- **Send** is disabled until you type something, and is disabled entirely until a model is loaded.
- Responses **stream** token-by-token into bubbles: your messages right (amber), AI left (charcoal).
- **View → Text Size** (12–22) changes bubble font size live.
- **File → Clear Chat** wipes the conversation (the model stays loaded).

## 🤖 Agent Mode

Agent Mode turns the chat into a tool-using assistant that works inside a **workspace folder**:

1. Toggle **🤖 Agent Mode: OFF → ON**.
2. Choose a workspace (combo box or 📁 browse button). Default: `./agent_workspace`.
3. Ask for file operations — e.g. *"Create a markdown file listing today's tasks"*.

The agent will:
- Analyze complex requests,
- Plan tool calls and stream status updates (🤔/💡/→/✓/✗),
- Execute tools against the workspace — `list_directory`, `read_file`, `write_file`, `edit_file`, `search_files`,
- Summarize results in natural language.

**Safety**: all tools are sandboxed to the workspace; paths that escape it are rejected.

## 🎨 Appearance

- **View → Dark Mode** toggles the "Midnight & Amber" dark theme and a light theme.
- **View → Text Size** adjusts chat bubble text.
- The app remembers dark mode per session (dark is the default).

## 🧩 Addons

The **Addons** menu lists every loaded addon (e.g. **floating_chat**). Selecting one opens it in a floating dialog; **Refresh Addons** re-scans the `addons/` folder. See the [Addon Development Guide](/docs/addon-development/).

### 💬 Floating Chat

The built-in addon adds a Messenger-style floating button (always on top, draggable) that opens a chat window connected to the loaded model. It:

- Stays on top of all windows (see platform notes below)
- Remembers its position between sessions
- Shows model status (🟢 Ready / 🔴 offline) and streams responses
- Has Copy All / Clear controls

**Platform notes**: fully floating on Windows and Linux/X11. On Linux **Wayland**, compositors confine it to the app window — run under X11 (`QT_QPA_PLATFORM=xcb`) for the full effect. On macOS the button stays visible when the app loses focus but also appears in Mission Control.

## 📁 Where Files Live

- **Config**: `%APPDATA%\GGUFLoader` (Windows) / `~/.ggufloader` (Linux/macOS)
- **Cache**: `%LOCALAPPDATA%\GGUFLoader\cache` (Windows) / `~/.cache/ggufloader` (Linux)
- **Logs**: `%LOCALAPPDATA%\GGUFLoader\logs` (Windows) / `~/.ggufloader/logs` (Linux)
- **Addons**: the `addons/` folder next to the app

## ❤️ Feedback

**Help → Send Feedback** opens the feedback dialog. Point it at your own Formspree endpoint via `feedback_config.json`:

```json
{ "endpoint_url": "https://formspree.io/f/YOUR_FORM_ID" }
```

## 🆘 Still Stuck?

See the [Troubleshooting Guide](/docs/troubleshooting/).

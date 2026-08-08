---
title: "Package Structure"
description: "Technical documentation of GGUF Loader's package structure and organization"
permalink: /docs/package-structure/
layout: docs
toc: true
tags: ["technical", "architecture", "package", "structure", "development"]
related_docs: ["addon-development", "installation", "addon-api"]
difficulty: "advanced"
reading_time: "10 minutes"
---

# Package Structure

This page documents how the GGUF Loader codebase is organized. The app is a PySide6 desktop application; a single `main.py` bootstraps everything, and logic is split into `core/` (pure logic), `services/` (Qt threading bridges), and `ui/` + `widgets/` (presentation).

## 🗂️ Top-Level Layout

```
gguf-loader/
├── main.py                 # Entry point: logging, DLL paths, QApplication, MainWindow
├── config.py               # Central configuration constants
├── resource_manager.py     # Resource/path discovery (dev, package, or frozen)
├── addon_manager.py        # Loads and manages addons
├── requirements.txt        # Python dependencies
├── build_exe.spec          # PyInstaller spec used for Windows & Linux builds
│
├── core/                   # Pure, testable logic (no Qt)
│   ├── llm/
│   │   ├── model_backend.py    # Thread-safe llama-cpp-python wrapper
│   │   └── prompt_builder.py   # System-prompt & conversation assembly
│   └── agent/
│       ├── agent_engine.py     # Tool-use agent loop (no Qt, no llama_cpp)
│       └── tool_registry.py    # Sandboxed workspace tools
│
├── services/               # QObject bridges that run work on threads
│   ├── model_service.py        # Load/unload models on a QThread
│   ├── chat_service.py         # Streaming generation on a QThread
│   ├── agent_service.py        # Runs AgentEngine on a worker thread
│   ├── environment_service.py  # venv/dependency checks & pip tasks
│   └── launcher_service.py     # Launches scripts/ utilities
│
├── ui/                     # Main window & panels
│   ├── main_window.py          # Composition root + addon-facing API
│   ├── chat_panel.py           # Chat display, input, agent controls
│   ├── sidebar_panel.py        # Model settings sidebar
│   └── theme.py                # Dark/light QSS token system
│
├── widgets/                # Reusable widgets
│   ├── chat_bubble.py          # ChatGPT-style bubble
│   └── feedback_dialog.py      # Feedback form dialog
│
├── addons/                 # Addon packages (each has __init__.py with register())
│   └── floating_chat/          # Built-in floating chat addon
│
├── scripts/                # Utility & release scripts
│   ├── capture_screenshots.py  # Regenerates README/site screenshots
│   ├── install_linux.sh        # Linux installer/uninstaller
│   ├── package_linux.sh        # Builds the Linux .tar.gz release
│   └── ...                     # GPU install/monitor helpers
│
└── build_hooks/            # PyInstaller hook modules
```

## 🔁 Key Design Rules

- **`core/` never imports Qt or llama_cpp.** It receives plain callables, so it can be unit-tested in isolation.
- **`services/` are the only place Qt threads are created.** UI never spins up threads directly.
- **`ui/` widgets are "dumb"** — they render state and emit signals; `MainWindow` owns all logic.
- **`resource_manager.py`** makes paths work identically in dev, as an installed package, and in a PyInstaller bundle (`sys._MEIPASS`).

## 🧵 Threading Model

```
UI thread (MainWindow)          Worker thread
        │                             │
        │── ModelService.load() ─────→│  QThread: llama_cpp loads model
        │←────── loaded(ModelBackend) │
        │── ChatService.generate() ──→│  QThread: streams tokens
        │←────── token_received(text) │
        │── AgentService.process() ──→│  QThread: AgentEngine tool loop
        │←────── status/tool/response │
```

A fresh `QThread` + worker is created per request (the professional Qt pattern — `QThread` is never subclassed).

## 🚀 Entry Point Flow

`main.py` → `setup_library_path()` (finds bundled llama.cpp libs) → `QApplication` → `MainWindow()` → builds UI, wires services, checks environment, loads addons → `app.exec()`.

## 📦 Packaging

- **Windows**: `build_exe.bat` / `build_exe.spec` → `GGUFLoader_vX.Y.Z.exe`
- **Linux**: build the spec inside a Linux environment, then `scripts/package_linux.sh` wraps the binary + installer + icon into a `.tar.gz`
- GitHub Actions publishes both to every release automatically.

See the [Architecture Overview](/docs/architecture/) for deeper design rationale.

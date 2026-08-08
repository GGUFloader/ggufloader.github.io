---
title: "Architecture Overview"
description: "Technical architecture and design of GGUF Loader"
permalink: /docs/architecture/
layout: docs
toc: true
tags: ["architecture", "technical", "design", "development"]
related_docs: ["package-structure", "addon-api", "addon-development"]
difficulty: "advanced"
reading_time: "15 minutes"
---

# Architecture Overview

GGUF Loader is a PySide6 desktop application with a strict layering rule: **pure logic in `core/`, threading bridges in `services/`, dumb widgets in `ui/`**. This keeps the hard parts unit-testable and the UI predictable.

## 🏗️ Layer Diagram

```
┌────────────────────────────────────────────────┐
│  ui/ (MainWindow, ChatPanel, SidebarPanel)     │  presentation only;
│  widgets/ (ChatBubble, FeedbackDialog)         │  emits signals, renders state
└───────────────┬────────────────────────────────┘
                │ Qt signals
┌───────────────▼────────────────────────────────┐
│  services/ (Model/Chat/Agent/Environment)      │  QObject bridges;
│                                               │  own QThreads + workers
└───────┬──────────────────────┬─────────────────┘
        │                      │
┌───────▼────────┐   ┌─────────▼───────────────┐
│ core/llm       │   │ core/agent              │  pure Python;
│ ModelBackend   │   │ AgentEngine, Tools      │  no Qt, no llama_cpp
│ PromptBuilder  │   │ ToolRegistry            │
└───────┬────────┘   └─────────────────────────┘
        │
┌───────▼────────┐
│ llama-cpp-python│  the only dependency on the
│ (Llama runtime) │  native GGUF inference lib
└────────────────┘
```

## ⚙️ ModelBackend (`core/llm/model_backend.py`)

The **only** module that talks to `llama_cpp`. It wraps a loaded `Llama` object and serializes all access with a `threading.Lock`, so UI threads and addons can call it concurrently without crashing the runtime.

- `load()` / `unload()` manage the runtime lifecycle.
- `__call__(prompt, stream=True, ...)` keeps the historical llama-cpp callable shape, so addons that called the raw object keep working.
- `generate(prompt, **kwargs)` returns a complete string; `generate_stream(...)` yields tokens.
- Qt-free by design — unit-testable and reusable from any thread.

## 🧵 ModelService (`services/model_service.py`)

Owns the current `ModelBackend`. Every load request creates a **fresh `QThread` + worker** (never subclassing `QThread`):

1. `load(path, use_gpu, n_ctx)` unloads any previous model and starts the thread.
2. The worker constructs a `ModelBackend` and calls `load()`.
3. `loaded` / `error` signals return to the UI thread; the thread is quit and garbage-collected.

Exposes `backend` (the `ModelBackend`) and `model` (a callable-compatible view used by addons).

## 💬 ChatService (`services/chat_service.py`)

Streams generation off the UI thread. `ChatService.generate(backend, prompt, ...)` runs llama-cpp inference in a worker thread and emits `token_received` per token, `finished`, and `error` — so even a long 2048-token response never freezes the window.

## 🤖 AgentEngine (`core/agent/agent_engine.py`)

A pure, testable tool-use loop. It receives a plain callable `llm(prompt, max_tokens, temperature) -> str` (the UI wires it to `ModelBackend.__call__`) plus a workspace path, and runs per user message:

1. **Optional quick analysis** for complex requests.
2. **Ask the model for a JSON tool-call plan** (`extract_json` handles fenced/bare/embedded JSON).
3. **Execute each tool**, streaming `status` callbacks and `tool` events.
4. **Ask for a natural-language final response**, with a graceful fallback summary if the model returns nothing useful.

### ToolRegistry (`core/agent/tool_registry.py`)

Sandboxed filesystem tools — `list_directory`, `read_file`, `write_file`, `edit_file`, `search_files`. Every tool resolves paths against a single workspace root and **rejects any path that escapes it** (`Path.resolve()` + containment check). Reading enforces a max size and BOM-aware encoding detection.

## 🎛️ MainWindow (`ui/main_window.py`)

The composition root. It:

- Owns the four services (Model/Chat/Agent/Environment) and a `PromptBuilder`.
- Builds the header (brand + status chip), sidebar, chat panel, and menu bar (File / View / Addons / Help).
- **Exposes the addon-facing API** that historical `AIChat`/`GGUFLoaderApp` provided:
  - `model` — callable `ModelBackend` or `None`
  - `model_loaded` / `model_unloaded` / `generation_finished` / `generation_error` signals
  - `chat_generator` — always `None` (addons fall back to calling `model`)
  - `addon_manager`, `_floating_chat_addon`

## 🎨 Theming (`ui/theme.py`)

A single `QSS_TEMPLATE` with `$token` placeholders is rendered twice — `DARK_TOKENS` ("Midnight & Amber": slate-charcoal surfaces + amber accent) and `LIGHT_TOKENS`. `ThemeMixin.apply_styles()` swaps palettes at runtime; widgets read `self.tokens` for stateful colors. Because one template drives both themes, they can never drift apart.

## 🧩 Addons (`addon_manager.py` + `addons/`)

`AddonManager` scans the `addons/` folder for packages with `__init__.py`, loads each module dynamically, and calls its `register()` function. A registered addon returns a widget (shown in the Addons menu) and/or runs in the background. See the [Addon Development Guide](/docs/addon-development/) and [Addon API Reference](/docs/addon-api/).

The built-in **floating_chat** addon is a good reference: it locates the main window via `QApplication.topLevelWidgets()`, subscribes to model signals, and manages its own always-on-top windows.

## 📦 Deployment

- `resource_manager.py` detects dev / installed-package / PyInstaller (`sys.frozen`) and resolves paths accordingly — models, config, cache, logs, addons, and llama.cpp libs.
- `main.py`'s `setup_library_path()` registers the bundled `llama_cpp/lib` so native DLLs are found in frozen builds.
- `build_exe.spec` + hooks (`build_hooks/`) package everything; `scripts/package_linux.sh` wraps the Linux binary into an installable tarball.

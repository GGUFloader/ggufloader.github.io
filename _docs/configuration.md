---
title: "Configuration Guide"
description: "Complete guide to configuring GGUF Loader settings and options"
permalink: /docs/configuration/
layout: docs
toc: true
tags: ["configuration", "settings", "options", "customization"]
related_docs: ["installation", "user-guide", "troubleshooting"]
difficulty: "intermediate"
reading_time: "10 minutes"
---

# Configuration Guide

Most GGUF Loader settings are controlled from the in-app UI (sidebar + menus), but developer-facing constants live in `config.py`, and two runtime details are configured with files next to the app.

## ⚙️ In-App Settings

### Model Settings Sidebar
| Setting | Options | Notes |
|---|---|---|
| Processing | `CPU Only` / `GPU Accelerated` | Choose before loading a model |
| Context Length | 512 – 32768 | Default `32768`; larger = more RAM |

### Menu Bar
| Menu | Item | Effect |
|---|---|---|
| File | Load Model… | Open a `.gguf` file |
| File | Clear Chat | Wipe the conversation |
| View | Dark Mode | Toggle Midnight & Amber ↔ light theme |
| View | Text Size | 12–22 px bubble font |
| Addons | <addon name> | Open an addon dialog |
| Help | Send Feedback / About | Feedback form, version info |

## 📝 config.py

Developer-facing constants at the repo root:

```python
WINDOW_TITLE = "GGUF Loader"
WINDOW_SIZE = (1200, 900)
MIN_WINDOW_SIZE = (800, 500)

GPU_OPTIONS = ["CPU Only", "GPU Accelerated"]
DEFAULT_CONTEXT_SIZES = ["512", "1024", "2048", "4096", "8192", "16384", "32768"]
MAX_TOKENS = 2048

FONT_FAMILY = "Vazirmatn, Segoe UI, Arial"
BUBBLE_FONT_SIZE = 18
CHAT_BUBBLE_FONT_SIZE = 14
```

### System Prompts
`ENGLISH_SYSTEM_PROMPTS` maps a prompt preset name to a `{name, prompt, params}` dict. `params` are the generation defaults (`temperature`, `top_p`, `max_tokens`) used for that preset. Prompts are consumed by `core/llm/prompt_builder.py`.

### Paths
`get_paths()` returns directories for models, chats, exports, logs, config, and cache. It delegates to `resource_manager.py`, which resolves them correctly in dev, installed-package, and frozen (PyInstaller) deployments:

- **Windows (frozen)**: `%APPDATA%\GGUFLoader` (config), `%LOCALAPPDATA%\GGUFLoader\cache` and `\logs`
- **Linux/macOS (frozen)**: `~/.ggufloader` (config), `~/.cache/ggufloader` (cache), `~/.ggufloader/logs`
- **Dev**: local `config/`, `cache/`, `logs/` folders in the repo

## 📄 Runtime Config Files

### feedback_config.json (optional)
Placed next to the app; points the Feedback dialog at your own endpoint:

```json
{ "endpoint_url": "https://formspree.io/f/YOUR_FORM_ID" }
```

If missing, the dialog uses the default Formspree placeholder.

### Agent workspace
The agent workspace defaults to `./agent_workspace` (created automatically). You can type any path in the workspace combo box or browse with the 📁 button.

## 🎨 Themes

Themes are defined as token dicts in `ui/theme.py` (`DARK_TOKENS`, `LIGHT_TOKENS`) rendered through a single QSS template. To recolor the app, edit the token values — not the stylesheet — so both themes stay consistent.

## 🛠️ Advanced: Command-Line Flags

`python main.py` accepts:

```
--version, -v   Show version and exit
--help, -h      Show help and exit
```

These short-circuit before any Qt window is created (useful for CI smoke tests).

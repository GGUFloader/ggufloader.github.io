---
title: "Addon Development Guide"
description: "Learn to create custom addons for GGUF Loader with examples and best practices"
permalink: /docs/addon-development/
layout: docs
toc: true
tags: ["development", "addons", "api", "python", "extensions"]
related_docs: ["addon-api", "floating-chat-example", "package-structure"]
difficulty: "advanced"
reading_time: "15 minutes"
---

# Addon Development Guide

GGUF Loader's addon system lets you extend the app without touching its source. Addons are Python packages dropped into the `addons/` folder; the app discovers, loads, and manages them automatically.

## 📦 What an Addon Looks Like

```
addons/
└── my_addon/
    ├── __init__.py      # must expose register()
    ├── main.py          # your logic (any structure you like)
    └── ...              # widgets, resources, etc.
```

### Minimum viable addon

```python
# addons/my_addon/__init__.py
from PySide6.QtWidgets import QLabel

def register(parent=None):
    """Called by GGUF Loader when the addon loads."""
    return QLabel("Hello from my addon!")
```

That's it — drop the folder in `addons/`, restart (or **Addons → Refresh Addons**), and your widget appears in the **Addons** menu.

## 🔍 How Loading Works

`AddonManager` (`addon_manager.py`):

1. `scan_addons()` — lists subdirectories of the addons folder that contain `__init__.py`.
2. `load_addon(name, path)` — dynamically imports the module (`importlib.util.spec_from_file_location`) and requires a `register` attribute.
3. `load_all_addons()` — loads every addon and records success/failure in the console log.
4. `get_addon_widget(name, parent)` — calls `register(parent)` and returns the widget.
5. `open_addon_dialog(name, parent)` — shows the addon widget in a non-modal dialog from the Addons menu.

The main window calls `get_addon_widget` for each loaded addon at startup, so `register()` runs even before the user opens the menu — this is how background addons (like the floating chat button) start automatically.

## 📡 Talking to the App

Your `register(parent)` receives the parent widget. The **main window** exposes an addon-facing API (see the [Addon API Reference](/docs/addon-api/)). The robust pattern used by the built-in addon:

```python
def register(parent=None):
    gguf_app = None
    # 1. Parent might already be the main window
    if parent and hasattr(parent, 'model') and hasattr(parent, 'model_loaded'):
        gguf_app = parent
    else:
        # 2. Walk up the parent chain
        current = parent
        while current is not None:
            if hasattr(current, 'model') and hasattr(current, 'model_loaded'):
                gguf_app = current
                break
            current = current.parent()
        # 3. Fall back to scanning top-level widgets
        if gguf_app is None:
            app = QApplication.instance()
            for widget in app.topLevelWidgets():
                if hasattr(widget, 'model') and hasattr(widget, 'model_loaded'):
                    gguf_app = widget
                    break
    ...
```

Key API members: `model` (callable backend), `model_loaded` / `model_unloaded` / `generation_finished` / `generation_error` signals, `addon_manager`, and `_floating_chat_addon`.

## 🤖 Calling the Model

```python
# Streaming
for token in gguf_app.model(prompt, stream=True, max_tokens=512):
    print(token["choices"][0]["text"])

# Or use the backend directly
response = gguf_app.model.generate(prompt, max_tokens=512, temperature=0.7)
```

`model` is `None` until the user loads a model — always check, and subscribe to `model_loaded` to react.

## 🧩 Widget vs. Background Addons

- **Return a widget** from `register()` → appears in the Addons menu, opens in a dialog.
- **Return `None`** (or also keep your own top-level windows) → runs in the background. The floating chat addon returns a small status widget but drives its own always-on-top windows.

## 💡 Best Practices

1. **Guard everything** — wrap registration in `try/except` and log failures; a broken addon must never crash the app.
2. **Clean up state** — if you keep references on the main window (e.g. `gguf_app._my_addon = ...`), stop them on app close (`MainWindow.closeEvent` stops `_floating_chat_addon` — follow that pattern).
3. **Use QSettings for persistence** — `QSettings("GGUFLoader", "YourAddon")`.
4. **Prefer signals** — let your widgets emit signals; don't reach into other widgets' internals.
5. **Qt-free logic** — if you have non-UI logic (parsing, computation), put it in a module with no Qt imports so it's unit-testable.

## ✅ Debugging

Addon load errors print to the console with a traceback (`Failed to load addon <name>: ...`). Run the app from a terminal to see them:

```bash
python main.py
```

## 📚 Next Steps

- [Addon API Reference](/docs/addon-api/) — every hook and member
- [Floating Chat Example](/docs/floating-chat-example/) — full walkthrough of the built-in addon

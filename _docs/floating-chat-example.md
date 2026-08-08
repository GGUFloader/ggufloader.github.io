---
title: "Floating Chat Example"
description: "Complete walkthrough of the built-in floating chat addon - signals, windows, and lifecycle"
permalink: /docs/floating-chat-example/
layout: docs
toc: true
tags: ["example", "floating-chat", "addon", "tutorial", "code"]
related_docs: ["addon-development", "addon-api", "quick-start"]
difficulty: "intermediate"
reading_time: "20 minutes"
---

# Floating Chat Example

This page walks through **floating_chat**, GGUF Loader's built-in addon — a Facebook Messenger-style floating button that opens a chat window connected to the loaded model. It's the best real-world reference for writing a background addon with its own windows.

```
addons/floating_chat/
├── __init__.py          # exposes register()
├── main.py              # FloatingChatAddon (QObject) + register()
├── floating_button.py   # FloatingChatButton - draggable always-on-top button
├── chat_window.py       # FloatingChatWindow - the chat UI
└── status_widget.py     # small sidebar widget returned by register()
```

## 🧠 The Design

The addon is a `QObject` (`FloatingChatAddon`) that owns two windows:

- **`FloatingChatButton`** — a frameless, always-on-top tool window that can be dragged anywhere and remembers its position via `QSettings`.
- **`FloatingChatWindow`** — a regular top-level window (`400×600`) positioned next to the button, with a message list, streaming replies, and Copy All / Clear buttons.

## 🪝 Registration

`__init__.py` simply re-exports `register`:

```python
from .main import register
__all__ = ['register']
```

`register()` finds the main window (parent → parent chain → `topLevelWidgets()` scan), stops any previous instance, starts the addon, and returns a **status widget** for the sidebar:

```python
def register(parent=None):
    gguf_app = _find_main_window(parent)      # model + model_loaded check
    if gguf_app is None:
        return None
    if getattr(gguf_app, '_floating_chat_addon', None):
        gguf_app._floating_chat_addon.stop()
    addon = FloatingChatAddon(gguf_app)
    if addon.start():
        gguf_app._floating_chat_addon = addon
        return FloatingChatStatusWidget(addon)
    return None
```

The returned `FloatingChatStatusWidget` shows up in the **Addons** menu, and because `register()` runs at startup, the button appears automatically — no user action needed.

## 📡 Connecting to the App

`FloatingChatAddon.__init__` subscribes to model lifecycle signals:

```python
if hasattr(self.gguf_app, 'model_loaded'):
    self.gguf_app.model_loaded.connect(self._on_model_loaded)
if hasattr(self.gguf_app, 'generation_finished'):
    self.gguf_app.generation_finished.connect(self._on_generation_finished)
if hasattr(self.gguf_app, 'generation_error'):
    self.gguf_app.generation_error.connect(self._on_generation_error)
```

`_on_model_loaded` flips the chat window's status to **🟢 Model: Ready**; generation events update the streaming bubble / error state.

## 🏃 Lifecycle: start() / stop()

```python
def start(self):
    self._floating_button = FloatingChatButton()
    self._floating_button.clicked.connect(self._on_button_clicked)
    self._load_button_position()          # QSettings restore, clamped to screen
    self._floating_button.show()
    self.addon_started.emit()
    return True

def stop(self):
    self._save_button_position()          # persist for next session
    if self._chat_window: self._chat_window.close()
    if self._floating_button: self._floating_button.close()
    self.addon_stopped.emit()
```

`stop()` is idempotent and called on app close via `MainWindow.closeEvent`, so there's never a dangling button.

## 🖱️ Button Click → Window Toggle

The click handler distinguishes three states (a minimized window is "visible" to Qt but off-screen, so it must be restored, not hidden):

```python
def _on_button_clicked(self):
    chat = self._chat_window
    if chat and chat.isVisible():
        if chat.isMinimized():
            chat.showNormal(); chat.raise_(); chat.activateWindow()
        else:
            chat.hide()
    else:
        self._show_chat_window()
```

`_show_chat_window` creates the window lazily, positions it next to the button (flipping to the left / up when it would overflow the screen's **available geometry**, which excludes taskbars and docks), then `showNormal()` + `raise_()` + `activateWindow()`.

## 🪟 Window Flags (the platform subtleties)

```python
flags = (Qt.WindowType.FramelessWindowHint |
         Qt.WindowType.WindowStaysOnTopHint |
         Qt.WindowType.X11BypassWindowManagerHint)   # Linux/X11
if sys.platform != "darwin":
    flags |= Qt.WindowType.Tool   # keeps it out of the taskbar
```

- **Windows/Linux**: `Tool` keeps the button out of the taskbar. `X11BypassWindowManagerHint` gives true always-on-top under X11.
- **macOS**: the `Tool` flag would turn the button into a utility window that **auto-hides when the app loses focus** — so it's deliberately dropped. Trade-off: the button appears in Mission Control.
- **Wayland**: compositors don't allow floating above *other* apps' windows; the button is confined to the app window (documented, and X11 is recommended for the full experience).

The chat window drops the minimize button entirely — a minimized companion window is a trap state that can't be reliably restored.

## 📌 Resiliancy Touches

- `changeEvent` bounces the button straight back to normal if a system shortcut (e.g. Win+D) minimizes *every* window including the tool:
  ```python
  if event.type() == QEvent.Type.WindowStateChange and self.isMinimized():
      QTimer.singleShot(0, self.showNormal)
  ```
- Dragging clamps to `screen.availableGeometry()` (not `(0,0)`), so the button can't slide under the macOS menu bar or a Windows taskbar.
- Saved positions are clamped the same way on restore.

## 🧩 What You Can Reuse

- The **window-finding pattern** in `register()` — works for any addon.
- The **QSettings position persistence** with on-screen clamping.
- The **platform-conditional window flags** — copy it for any always-on-top addon window.
- The **show/hide/restore toggle** logic.

## 📚 See Also

- [Addon Development Guide](/docs/addon-development/)
- [Addon API Reference](/docs/addon-api/)

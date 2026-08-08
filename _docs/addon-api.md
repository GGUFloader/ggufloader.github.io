---
title: "Addon API Reference"
description: "Complete API reference for developing GGUF Loader addons"
permalink: /docs/addon-api/
layout: docs
toc: true
tags: ["api", "reference", "development", "addons", "python"]
related_docs: ["addon-development", "floating-chat-example", "package-structure"]
difficulty: "advanced"
reading_time: "20 minutes"
---

# Addon API Reference

Complete reference for the hooks, signals, and objects available to GGUF Loader addons.

## 🪝 Addon Contract

An addon is a folder under `addons/` with an `__init__.py` exposing:

### `register(parent=None) -> QWidget | None`

Called by `AddonManager` when the addon loads. Returns an optional widget shown in the Addons menu (opened in a non-modal dialog), or `None` for background-only addons.

**Parameters** — `parent`: the widget the addon is being attached to (may be the main window, a dialog, or another widget).

**Return** — a widget, or `None`.

```python
def register(parent=None):
    return QLabel("My Addon")   # widget addon
```

## 🖥️ Main Window API

Addons receive a reference to the main window (via `parent` or by scanning `QApplication.instance().topLevelWidgets()`). It exposes:

### Properties
| Member | Type | Description |
|---|---|---|
| `model` | `ModelBackend \| None` | The loaded model backend; callable. `None` until a model is loaded. |
| `chat_generator` | `None` | Legacy hook; always `None`. Addons should call `model` instead. |
| `addon_manager` | `AddonManager` | The addon manager instance. |
| `_floating_chat_addon` | `FloatingChatAddon \| None` | The built-in floating chat addon (if running). |

### Signals
| Signal | Signature | Description |
|---|---|---|
| `model_loaded` | `Signal(object)` | Emitted with the `ModelBackend` after a model loads. |
| `model_unloaded` | `Signal()` | Emitted after the model is released. |
| `generation_finished` | `Signal()` | Emitted when a chat generation completes. |
| `generation_error` | `Signal(str)` | Emitted with an error message when generation fails. |
| `theme_changed` | `Signal(bool)` | Emitted when dark mode toggles (`True` = dark). |

```python
gguf_app.model_loaded.connect(self._on_model_loaded)
gguf_app.generation_finished.connect(self._on_finished)
```

## 🧠 ModelBackend

`gguf_app.model` is a `core.llm.model_backend.ModelBackend`. It is **callable** and thread-safe (all access serialized through a lock).

### Calling convention
```python
# Raw llama-cpp shape (addon-compatible)
result = gguf_app.model(prompt, stream=False, max_tokens=512, temperature=0.7)
text = result["choices"][0]["text"]

# Streaming
for token_data in gguf_app.model(prompt, stream=True, max_tokens=512):
    text = token_data["choices"][0]["text"]
```

### Methods & attributes
| Member | Description |
|---|---|
| `model_path` | Path of the loaded GGUF file. |
| `use_gpu` | Whether GPU acceleration is active. |
| `n_ctx` | Context length. |
| `is_loaded` | `True` once the runtime exists. |
| `load()` | Create the underlying `Llama` runtime (raises on failure). |
| `unload()` | Release the model and free memory. |
| `generate(prompt, **kwargs)` | Complete non-streamed response string. |
| `generate_stream(prompt, **kwargs)` | Iterator of token strings. |
| `__call__(prompt, **kwargs)` | llama-cpp-compatible callable (stream returns token-dict generator). |

**kwargs** are passed straight to llama_cpp: `max_tokens`, `temperature`, `top_p`, `top_k`, `repeat_penalty`, `stop`, etc.

## 🧰 Agent Tools (for Agent-capable addons)

The agent engine (`core/agent/`) exposes sandboxed tools through `ToolRegistry`. Tools are not Qt-bound and are safe to call from any thread.

| Tool | Params | Result |
|---|---|---|
| `list_directory` | `path` (default `.`) | `{status, result: [{name, type, size}]}` |
| `read_file` | `path`, `max_size`, `encoding` | `{status, result: content, lines, encoding}` |
| `write_file` | `path`, `content` | `{status, path, bytes_written}` |
| `edit_file` | `path`, `operation` (`replace`/`insert_line`/`delete_line`), `find`, `replace`, `line_number`, `content` | `{status, operation, changes_made}` |
| `search_files` | `pattern`/`query`, `path` | `{status, result: [paths], total_matches}` |

Every tool result includes `status` (`"success"` / `"error"`) and `tool_name`. All paths are **sandboxed to the workspace** — escaping paths raise.

```python
from core.agent.tool_registry import create_default_registry
registry = create_default_registry("./workspace")
result = registry.execute("list_directory", {"path": "."})
```

## 🧩 AddonManager

| Method | Description |
|---|---|
| `scan_addons()` | `{name: path}` of addons with `__init__.py`. |
| `load_addon(name, path)` | Import + validate `register`; `True`/`False`. |
| `load_all_addons()` | Load all; `{name: success}`. |
| `get_addon_widget(name, parent)` | Widget from `register(parent)`. |
| `open_addon_dialog(name, parent)` | Show addon in a non-modal dialog. |
| `get_loaded_addons()` | List of successfully loaded names. |

## 💾 Persistence

Use Qt's `QSettings` with a scoped org/app key to avoid collisions:

```python
from PySide6.QtCore import QSettings
settings = QSettings("GGUFLoader", "MyAddon")
settings.setValue("position", point)
pos = settings.value("position", QPoint(100, 100))
```

## ⚡ Lifecycle

- `register()` is called at startup and on **Addons → Refresh Addons**.
- The main window's `closeEvent` stops the floating chat addon; follow that pattern to stop your own background objects:
  ```python
  if hasattr(gguf_app, '_my_addon') and gguf_app._my_addon:
      gguf_app._my_addon.stop()
  ```

## 📚 See Also

- [Addon Development Guide](/docs/addon-development/) — tutorial
- [Floating Chat Example](/docs/floating-chat-example/) — full real-world addon

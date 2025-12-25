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

This guide covers all configuration options available in GGUF Loader 2.0.0.

## 📁 Configuration Files

### Location

Configuration files are stored in:

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%\ggufloader\` |
| macOS | `~/.config/ggufloader/` |
| Linux | `~/.config/ggufloader/` |

### Files

- `config.json` - Main application settings
- `models.json` - Model-specific settings
- `addons/` - Addon configurations

## ⚙️ Application Settings

### General Settings

```json
{
  "theme": "dark",
  "language": "en",
  "font_size": 14,
  "auto_save_chat": true,
  "startup_model": null,
  "check_updates": true
}
```


| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `theme` | string | "dark" | UI theme ("dark" or "light") |
| `language` | string | "en" | Interface language |
| `font_size` | int | 14 | Base font size in pixels |
| `auto_save_chat` | bool | true | Auto-save chat history |
| `startup_model` | string | null | Model to load on startup |
| `check_updates` | bool | true | Check for updates on launch |

### Window Settings

```json
{
  "window": {
    "width": 1200,
    "height": 800,
    "x": 100,
    "y": 100,
    "maximized": false,
    "sidebar_visible": true,
    "sidebar_width": 250
  }
}
```

## 🤖 Model Settings

### Default Model Parameters

```json
{
  "model_defaults": {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "max_tokens": 512,
    "context_length": 4096
  }
}
```

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `temperature` | 0.0-2.0 | 0.7 | Response randomness |
| `top_p` | 0.0-1.0 | 0.9 | Nucleus sampling |
| `top_k` | 1-100 | 40 | Token selection limit |
| `repeat_penalty` | 1.0-2.0 | 1.1 | Repetition reduction |
| `max_tokens` | 1-4096 | 512 | Max response length |
| `context_length` | 512-32768 | 4096 | Context window size |

### Performance Settings

```json
{
  "performance": {
    "n_threads": 4,
    "n_gpu_layers": 0,
    "n_batch": 512,
    "use_mmap": true,
    "use_mlock": false
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `n_threads` | 4 | CPU threads for inference |
| `n_gpu_layers` | 0 | Layers to offload to GPU |
| `n_batch` | 512 | Batch size for processing |
| `use_mmap` | true | Memory-map model file |
| `use_mlock` | false | Lock model in RAM |

## 🔧 GPU Configuration

### NVIDIA CUDA

```json
{
  "gpu": {
    "enabled": true,
    "type": "cuda",
    "device_id": 0,
    "layers": 35
  }
}
```

### Apple Metal

```json
{
  "gpu": {
    "enabled": true,
    "type": "metal",
    "layers": -1
  }
}
```

### Determining GPU Layers

| GPU VRAM | Recommended Layers (7B model) |
|----------|------------------------------|
| 4GB | 10-15 layers |
| 6GB | 20-25 layers |
| 8GB | 30-35 layers |
| 12GB+ | All layers (-1) |

## ✨ Addon Configuration

### Smart Floater Settings

Located in `addons/smart_floater/config.json`:

```json
{
  "enabled": true,
  "check_interval": 300,
  "button_timeout": 3000,
  "max_text_length": 5000,
  "auto_copy_results": false,
  "hotkeys": {
    "quick_summarize": "ctrl+shift+s",
    "quick_comment": "ctrl+shift+c"
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | true | Enable/disable addon |
| `check_interval` | 300 | Selection check interval (ms) |
| `button_timeout` | 3000 | Button visibility duration (ms) |
| `max_text_length` | 5000 | Max characters to process |
| `auto_copy_results` | false | Auto-copy results to clipboard |

### Custom Addon Settings

Each addon can have its own `config.json` in:
```
~/.ggufloader/addons/<addon_name>/config.json
```

## 💬 Chat Settings

### Chat History

```json
{
  "chat": {
    "save_history": true,
    "max_history_items": 100,
    "history_location": "default",
    "export_format": "json"
  }
}
```

### System Prompts

```json
{
  "system_prompts": {
    "default": "You are a helpful AI assistant.",
    "coding": "You are an expert programmer...",
    "writing": "You are a creative writer..."
  }
}
```

## 🎨 UI Customization

### Theme Colors

```json
{
  "theme_colors": {
    "primary": "#0078d4",
    "secondary": "#106ebe",
    "background": "#1e1e1e",
    "text": "#ffffff",
    "accent": "#4CAF50"
  }
}
```

### Font Settings

```json
{
  "fonts": {
    "ui_font": "Segoe UI",
    "code_font": "Consolas",
    "chat_font_size": 14,
    "code_font_size": 12
  }
}
```

## 🔄 Import/Export Settings

### Export Configuration

```bash
# Export all settings
ggufloader --export-config backup.json

# Export specific section
ggufloader --export-config model_settings.json --section model
```

### Import Configuration

```bash
# Import settings
ggufloader --import-config backup.json

# Import and merge
ggufloader --import-config new_settings.json --merge
```

## 🛠️ Command Line Options

### Override Settings

```bash
# Override temperature
ggufloader --temperature 0.8

# Override GPU layers
ggufloader --n-gpu-layers 35

# Override threads
ggufloader --threads 8
```

### Configuration Commands

```bash
# Show current config
ggufloader --show-config

# Reset to defaults
ggufloader --reset-config

# Open config directory
ggufloader --config-dir
```

## 📋 Environment Variables

| Variable | Description |
|----------|-------------|
| `GGUF_LOADER_CONFIG` | Custom config file path |
| `GGUF_LOADER_MODELS` | Default models directory |
| `GGUF_LOADER_THEME` | Override theme |
| `GGUF_LOADER_GPU` | Enable/disable GPU |

## 🔒 Security Settings

```json
{
  "security": {
    "allow_external_addons": false,
    "verify_addon_signatures": true,
    "sandbox_addons": true,
    "log_level": "info"
  }
}
```

## 📚 Related Documentation

- [Installation Guide](/docs/installation/ "Setup and install") - Initial setup
- [User Guide](/docs/user-guide/ "Complete manual") - Using GGUF Loader
- [Troubleshooting](/docs/troubleshooting/ "Fix issues") - Common problems
- [Addon Development](/docs/addon-development/ "Create addons") - Addon configuration

---

**Need help with configuration?** Check our [community discussions](https://github.com/gguf-loader/gguf-loader/discussions) or contact support@ggufloader.com.

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

Welcome to the complete GGUF Loader user guide! This manual covers all features and capabilities of GGUF Loader 2.0.0.

## 🎯 Overview

GGUF Loader is a desktop application for running GGUF-based Large Language Models (LLMs) locally on your computer. It provides:

- **Easy Model Loading**: Load any GGUF model with a single click
- **Chat Interface**: Intuitive chat UI for interacting with AI models
- **Smart Floating Assistant**: AI-powered text processing across all applications
- **Addon System**: Extend functionality with custom addons
- **Privacy-First**: All processing happens locally on your machine

## 🚀 Getting Started

### Launching GGUF Loader

After [installation](/docs/installation/ "Complete installation guide"), launch GGUF Loader:

```bash
ggufloader
```

The main window will open with:
- Model selection area
- Chat interface
- Addon sidebar
- Settings menu

### Loading Your First Model

1. **Click "Select GGUF Model"** in the main window
2. **Navigate** to your GGUF model file
3. **Select** the model and click "Open"
4. **Wait** for the model to load (progress shown in status bar)
5. **Start chatting** once the model is ready

💡 **Tip**: Start with smaller models (4GB or less) for faster loading and better performance on systems with limited RAM.

## 💬 Chat Interface

### Basic Chat

The chat interface allows you to have conversations with your loaded AI model:

1. **Type your message** in the input field at the bottom
2. **Press Enter** or click "Send" to submit
3. **View the response** in the chat area
4. **Continue the conversation** as needed

### Chat Features

- **Message History**: Scroll up to view previous messages
- **Copy Responses**: Click to copy AI responses to clipboard
- **Clear Chat**: Reset the conversation history
- **Export Chat**: Save conversations for later reference

### Conversation Tips

- **Be Specific**: Clear, detailed prompts get better responses
- **Provide Context**: Give background information when needed
- **Use Examples**: Show the AI what format you want
- **Iterate**: Refine your prompts based on responses

## ✨ Smart Floating Assistant

The Smart Floating Assistant is GGUF Loader's flagship feature, providing AI-powered text processing across all applications.

### How It Works

1. **Select text** in any application (browser, editor, etc.)
2. **A floating button (✨)** appears near your selection
3. **Click the button** to open the processing menu
4. **Choose an action**: Summarize or Comment
5. **View and copy** the AI-generated result

### Available Actions

#### Summarize
Creates a concise summary of the selected text:
- Extracts key points
- Reduces lengthy content
- Maintains essential meaning

#### Comment
Generates thoughtful commentary on the selected text:
- Provides analysis and insights
- Offers different perspectives
- Adds context and explanation

### Smart Floater Settings

Access settings through the addon panel:
- **Enable/Disable**: Turn the floating assistant on or off
- **Button Timeout**: How long the button stays visible
- **Processing Options**: Customize AI parameters

## 🔧 Model Management

### Supported Models

GGUF Loader supports all GGUF format models, including:
- **LLaMA** and LLaMA 2 models
- **Mistral** and Mixtral models
- **DeepSeek** models
- **Phi** models
- **Qwen** models
- Any other GGUF-compatible model

### Model Selection Tips

| RAM Available | Recommended Model Size |
|---------------|----------------------|
| 4GB | Up to 3B parameters (Q4) |
| 8GB | Up to 7B parameters (Q4) |
| 16GB | Up to 13B parameters (Q4) |
| 32GB+ | Up to 70B parameters (Q4) |

### Quantization Levels

- **Q2_K**: Smallest, fastest, lowest quality
- **Q4_K_M**: Good balance of size and quality (recommended)
- **Q5_K_M**: Better quality, larger size
- **Q8_0**: Highest quality, largest size

### Loading Options

When loading a model, you can configure:
- **Context Length**: Maximum conversation length
- **GPU Layers**: Number of layers to offload to GPU
- **Threads**: CPU threads for processing

## 🧩 Addon System

### Understanding Addons

Addons extend GGUF Loader's functionality:
- **Pre-installed**: Smart Floating Assistant comes built-in
- **Custom Addons**: Create your own or install community addons
- **Sidebar Access**: All addons accessible from the sidebar

### Managing Addons

#### Viewing Installed Addons
1. Look at the **addon sidebar** on the right
2. Each addon shows as a **clickable button**
3. Click to **open the addon panel**

#### Addon Controls
- **Start/Stop**: Control addon execution
- **Settings**: Configure addon behavior
- **Status**: View addon status and logs

### Creating Custom Addons

Want to create your own addons? See:
- [Addon Development Guide](/docs/addon-development/ "Step-by-step addon creation")
- [Addon API Reference](/docs/addon-api/ "Complete API documentation")
- [Smart Floater Example](/docs/smart-floater-example/ "Learn from the built-in addon")

## ⚙️ Settings and Configuration

### Application Settings

Access settings through the menu:
- **Theme**: Light or dark mode
- **Font Size**: Adjust text size
- **Language**: Interface language
- **Startup**: Auto-load last model

### Model Settings

Configure model behavior:
- **Temperature**: Controls randomness (0.0-2.0)
- **Top P**: Nucleus sampling parameter
- **Top K**: Limits token selection
- **Repeat Penalty**: Reduces repetition
- **Max Tokens**: Maximum response length

### Performance Settings

Optimize for your system:
- **GPU Acceleration**: Enable CUDA or Metal
- **Thread Count**: CPU threads to use
- **Batch Size**: Processing batch size
- **Context Size**: Maximum context length

## 🖥️ Interface Overview

### Main Window Components

```
┌─────────────────────────────────────────────────────┐
│  Menu Bar                                           │
├─────────────────────────────────────────────────────┤
│                                          │ Addons   │
│  Chat Area                               │ Sidebar  │
│  - Messages displayed here               │          │
│  - Scroll for history                    │ [Smart]  │
│                                          │ [Floater]│
│                                          │          │
├─────────────────────────────────────────────────────┤
│  Input Field                    [Send]   │          │
├─────────────────────────────────────────────────────┤
│  Status Bar: Model info, processing status          │
└─────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send message |
| Ctrl+N | New chat |
| Ctrl+O | Open model |
| Ctrl+S | Save chat |
| Ctrl+, | Settings |
| Esc | Cancel/Close |

## 📊 Performance Tips

### Optimizing Speed

1. **Use GPU acceleration** if available
2. **Choose appropriate model size** for your RAM
3. **Close unnecessary applications** to free memory
4. **Use Q4 quantization** for best speed/quality balance

### Reducing Memory Usage

1. **Use smaller models** (7B or less)
2. **Lower context length** if not needed
3. **Use higher quantization** (Q2, Q3)
4. **Close other memory-intensive apps**

### Improving Quality

1. **Use larger models** if RAM allows
2. **Use lower quantization** (Q5, Q8)
3. **Increase context length** for longer conversations
4. **Fine-tune temperature** for your use case

## 🔒 Privacy and Security

### Local Processing

GGUF Loader processes everything locally:
- **No internet required** after installation
- **No data sent** to external servers
- **Complete privacy** for sensitive content
- **Offline capable** once models are downloaded

### Data Storage

- **Chat history**: Stored locally (optional)
- **Settings**: Saved in user config directory
- **Models**: Stored where you choose
- **Logs**: Local log files only

## 🐛 Common Issues

### Model Won't Load
- Check file format (must be `.gguf`)
- Verify sufficient RAM
- Try a smaller model
- Check file isn't corrupted

### Slow Performance
- Use GPU acceleration
- Try smaller model
- Reduce context length
- Close other applications

### Smart Floater Not Working
- Ensure model is loaded first
- Check addon is enabled
- Try selecting more text (5+ characters)
- Restart the application

For more help, see the [Troubleshooting Guide](/docs/troubleshooting/ "Common issues and solutions").

## 📚 Next Steps

- **[Quick Start Guide](/docs/quick-start/ "Get started in minutes")** - Fast setup walkthrough
- **[Addon Development](/docs/addon-development/ "Create custom addons")** - Build your own addons
- **[Configuration Guide](/docs/configuration/ "Customize settings")** - Advanced configuration
- **[Troubleshooting](/docs/troubleshooting/ "Fix common issues")** - Solve problems

## 💡 Tips and Tricks

### Power User Tips

1. **Batch Processing**: Use Smart Floater for quick text processing
2. **Custom Prompts**: Create templates for common tasks
3. **Model Switching**: Keep multiple models for different tasks
4. **Keyboard Navigation**: Learn shortcuts for faster workflow

### Best Practices

1. **Regular Updates**: Keep GGUF Loader updated
2. **Model Organization**: Organize models in dedicated folders
3. **Backup Settings**: Export your configuration
4. **Community Engagement**: Share tips and get help

---

**Need more help?** Check our [FAQ](/#faq "Frequently asked questions"), join [community discussions](https://github.com/gguf-loader/gguf-loader/discussions), or contact support@ggufloader.com.

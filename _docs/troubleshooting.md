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

This guide helps you solve common issues with GGUF Loader. Can't find your issue? Check our [community discussions](https://github.com/gguf-loader/gguf-loader/discussions) or contact support.

## 🚀 Installation Issues

### "pip not found" Error

**Problem**: Command `pip` is not recognized.

**Solutions**:
```bash
# Try using python -m pip
python -m pip install ggufloader

# Or python3 on macOS/Linux
python3 -m pip install ggufloader
```

### "Permission denied" Error

**Problem**: Installation fails due to permissions.

**Solutions**:
```bash
# Use --user flag
pip install --user ggufloader

# Or use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install ggufloader
```

### "Package not found" Error

**Problem**: pip can't find the ggufloader package.

**Solutions**:
```bash
# Update pip first
pip install --upgrade pip

# Then install
pip install ggufloader

# If still failing, try with trusted hosts
pip install --trusted-host pypi.org --trusted-host pypi.python.org ggufloader
```

### "Microsoft Visual C++ 14.0 required" (Windows)

**Problem**: Missing C++ build tools on Windows.

**Solution**: Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/):
1. Download the installer
2. Select "Desktop development with C++"
3. Install and restart
4. Retry `pip install ggufloader`

### "Command line tools not found" (macOS)

**Problem**: Missing Xcode command line tools.

**Solution**:
```bash
xcode-select --install
```

### Missing System Dependencies (Linux)

**Problem**: Build fails due to missing system packages.

**Solution**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel

# Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install python3-devel
```

## 📦 Model Loading Issues

### Model Won't Load

**Problem**: GGUF model fails to load or shows error.

**Solutions**:

1. **Check file format**: Must be `.gguf` extension
   ```
   ✅ model.gguf
   ❌ model.bin
   ❌ model.safetensors
   ```

2. **Check file integrity**: Re-download if corrupted
   - Verify file size matches source
   - Check MD5/SHA256 hash if available

3. **Check RAM availability**:
   - Model needs ~1.5x its file size in RAM
   - Close other applications
   - Try a smaller model

4. **Check file permissions**:
   - Ensure read access to the model file
   - Try moving to a different directory

### "Out of Memory" Error

**Problem**: System runs out of RAM when loading model.

**Solutions**:

1. **Use a smaller model**:
   | Your RAM | Max Model Size |
   |----------|---------------|
   | 4GB | ~2GB model |
   | 8GB | ~5GB model |
   | 16GB | ~12GB model |

2. **Use higher quantization**:
   - Q2_K or Q3_K are smallest
   - Q4_K_M is good balance

3. **Reduce context length**:
   - Lower from 4096 to 2048 or 1024

4. **Close other applications**:
   - Browsers use significant RAM
   - Close unused programs

### Model Loads But Doesn't Respond

**Problem**: Model loads successfully but chat doesn't work.

**Solutions**:

1. **Wait for full initialization**: Some models take time after loading
2. **Check status bar**: Ensure it shows "Ready"
3. **Try a simple prompt**: Start with "Hello"
4. **Restart the application**: Sometimes helps with initialization
5. **Try a different model**: Model may be incompatible

### Slow Model Loading

**Problem**: Model takes very long to load.

**Solutions**:

1. **Use SSD storage**: Models load faster from SSD than HDD
2. **Enable GPU acceleration**: Offload layers to GPU
3. **Use smaller models**: Larger models take longer
4. **Check disk health**: Slow disk can cause delays

## 💬 Chat Issues

### No Response from AI

**Problem**: AI doesn't respond to messages.

**Solutions**:

1. **Check model is loaded**: Status bar should show model name
2. **Wait for processing**: Check for "Processing..." indicator
3. **Try shorter prompts**: Very long prompts may timeout
4. **Restart application**: Clear any stuck states

### Slow Responses

**Problem**: AI responses take too long.

**Solutions**:

1. **Enable GPU acceleration**:
   ```bash
   # For NVIDIA GPUs
   pip uninstall llama-cpp-python
   pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121
   ```

2. **Reduce max tokens**: Lower response length limit
3. **Use smaller model**: Faster inference
4. **Increase CPU threads**: In settings
5. **Close background apps**: Free up resources

### Repetitive or Low-Quality Responses

**Problem**: AI gives repetitive or poor quality answers.

**Solutions**:

1. **Adjust temperature**: Try 0.7-0.9 for more variety
2. **Increase repeat penalty**: Set to 1.1-1.2
3. **Use better model**: Larger models give better responses
4. **Improve prompts**: Be more specific and detailed
5. **Clear chat history**: Start fresh conversation

### Chat History Lost

**Problem**: Previous conversations disappear.

**Solutions**:

1. **Enable auto-save**: In settings
2. **Export important chats**: Use export feature
3. **Check storage location**: Ensure write permissions
4. **Don't clear cache**: Avoid clearing app data

## ✨ Smart Floating Assistant Issues

### Button Doesn't Appear

**Problem**: The ✨ button doesn't show when selecting text.

**Solutions**:

1. **Check model is loaded**: Smart Floater needs a model
2. **Select more text**: Minimum 5 characters required
3. **Check addon is enabled**: Open addon panel to verify
4. **Wait a moment**: Button appears after brief delay
5. **Try different application**: Some apps block clipboard access

### Button Appears But Nothing Happens

**Problem**: Clicking the button doesn't open the menu.

**Solutions**:

1. **Check for popup blockers**: Some security software blocks popups
2. **Try clicking again**: May need a second click
3. **Check screen position**: Popup may be off-screen
4. **Restart addon**: Stop and start from addon panel

### Processing Fails

**Problem**: Summarize or Comment action fails.

**Solutions**:

1. **Check model is loaded**: Required for processing
2. **Try shorter text**: Very long text may timeout
3. **Check error message**: Provides specific guidance
4. **Restart application**: Clear any stuck states

### Clipboard Issues

**Problem**: Smart Floater interferes with clipboard.

**Solutions**:

1. **This is normal**: Smart Floater temporarily uses clipboard
2. **Clipboard is restored**: Original content is restored after
3. **If content lost**: Undo (Ctrl+Z) in source application
4. **Disable if problematic**: Turn off in addon settings

## 🔧 Performance Issues

### High CPU Usage

**Problem**: GGUF Loader uses too much CPU.

**Solutions**:

1. **Reduce thread count**: In settings
2. **Use GPU acceleration**: Offload work to GPU
3. **Use smaller model**: Less computation needed
4. **Lower context length**: Reduces processing

### High Memory Usage

**Problem**: Application uses too much RAM.

**Solutions**:

1. **Use smaller model**: Primary memory consumer
2. **Use higher quantization**: Q2, Q3, Q4 use less RAM
3. **Reduce context length**: Lower memory footprint
4. **Restart periodically**: Clears accumulated memory

### Application Freezes

**Problem**: GGUF Loader becomes unresponsive.

**Solutions**:

1. **Wait for processing**: Long operations may cause temporary freeze
2. **Check Task Manager**: See if still processing
3. **Force close if needed**: End task and restart
4. **Use smaller model**: Reduces freeze likelihood
5. **Report bug**: If happens consistently

## 🖥️ Platform-Specific Issues

### Windows Issues

**Antivirus Blocking**:
- Add GGUF Loader to antivirus exceptions
- Whitelist the installation directory

**DPI Scaling Issues**:
- Right-click ggufloader.exe → Properties → Compatibility
- Check "Override high DPI scaling behavior"

### macOS Issues

**"App is damaged" Error**:
```bash
xattr -cr /path/to/ggufloader
```

**Permission Denied for Accessibility**:
- System Preferences → Security & Privacy → Privacy → Accessibility
- Add GGUF Loader to allowed apps

### Linux Issues

**Display Issues (Wayland)**:
```bash
# Try running with X11
QT_QPA_PLATFORM=xcb ggufloader
```

**Missing Libraries**:
```bash
# Install Qt dependencies
sudo apt install libxcb-xinerama0 libxcb-cursor0
```

## 🔄 Update Issues

### Update Fails

**Problem**: Can't update to new version.

**Solutions**:
```bash
# Force reinstall
pip install --force-reinstall ggufloader

# Or uninstall and reinstall
pip uninstall ggufloader
pip install ggufloader
```

### Settings Lost After Update

**Problem**: Configuration reset after updating.

**Solutions**:

1. **Export settings before update**: Use export feature
2. **Check config location**: Settings may be in different location
3. **Reconfigure manually**: If settings can't be recovered

## 📞 Getting More Help

### Before Asking for Help

1. **Check this guide**: Most issues are covered here
2. **Search existing issues**: [GitHub Issues](https://github.com/gguf-loader/gguf-loader/issues)
3. **Gather information**:
   - GGUF Loader version
   - Operating system
   - Python version
   - Error messages
   - Steps to reproduce

### Where to Get Help

- **GitHub Issues**: [Report bugs](https://github.com/gguf-loader/gguf-loader/issues)
- **Discussions**: [Community help](https://github.com/gguf-loader/gguf-loader/discussions)
- **Email**: support@ggufloader.com

### Reporting Bugs

When reporting bugs, include:
1. **Version info**: `ggufloader --version`
2. **System info**: OS, Python version, RAM, GPU
3. **Steps to reproduce**: Exact steps that cause the issue
4. **Error messages**: Full error text or screenshots
5. **Model info**: Model name and size (if relevant)

---

**Still stuck?** Don't hesitate to reach out to our [community](https://github.com/gguf-loader/gguf-loader/discussions) - we're here to help! 🤝

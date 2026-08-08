---
title: "Quick Start Guide"
description: "Get up and running with GGUF Loader in just a few minutes"
permalink: /docs/quick-start/
layout: docs
toc: true
tags: ["quick-start", "getting-started", "tutorial", "beginner"]
related_docs: ["installation", "user-guide", "addon-development"]
difficulty: "beginner"
reading_time: "5 minutes"
---

# Quick Start Guide

Get up and running with GGUF Loader 2.1.2 in just a few minutes! New to GGUF Loader? [Check out the homepage](/) to see what makes it special.

## 🚀 Step 1: Install GGUF Loader

Follow the [Installation Guide](/docs/installation/) for your platform, or download directly:

- **Windows**: [GGUFLoader_v2.1.2.exe](https://github.com/GGUFloader/gguf-loader/releases/download/v2.1.2/GGUFLoader_v2.1.2.exe)
- **Linux**: [GGUFLoader_v2.1.2_linux_x86_64.tar.gz](https://github.com/GGUFloader/gguf-loader/releases/download/v2.1.2/GGUFLoader_v2.1.2_linux_x86_64.tar.gz)

## 📥 Step 2: Get a GGUF Model

GGUF Loader runs any GGUF-format model. Good starter models on Hugging Face:

- **Small (fast)**: [Llama-3-8B-Instruct GGUF (Q4_0)](https://huggingface.co/TheBloke/Llama-3-8B-Instruct-GGUF) — ~4.7 GB, runs great on CPU
- **Medium**: [Mistral-7B-Instruct GGUF (Q4_K_M)](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF) — ~4.1 GB
- **Larger**: [Phi-3.5-mini-instruct GGUF](https://huggingface.co/microsoft/Phi-3.5-mini-instruct-gguf) or any Qwen/Llama GGUF you like

Download the `.gguf` file and remember where you saved it.

## 🖥️ Step 3: Load the Model

1. Launch GGUF Loader.
2. In the **Model Settings** sidebar, choose **Processing** mode — `CPU Only` (default, works everywhere) or `GPU Accelerated` (NVIDIA CUDA).
3. Set a **Context Length** (8192 is a safe default for most models; 32768 uses more RAM).
4. Click **Load GGUF Model** and select your `.gguf` file.
5. Wait for the status to show **"Model ready!"** — the header chip turns green with the model name.

## 💬 Step 4: Chat

Type a message in the input box at the bottom and press **Enter** (Shift+Enter inserts a newline). Responses stream in as ChatGPT-style bubbles — your messages on the right (amber), the AI's on the left.

Use the **View → Text Size** menu to adjust bubble font size.

## 🤖 Step 5 (Optional): Try Agent Mode

Click **🤖 Agent Mode: OFF** in the input area to toggle it on:

1. Pick a **workspace folder** (defaults to `./agent_workspace`).
2. Ask the agent to do file work — e.g. *"Create a file called hello.py that prints 'hi'"*.
3. The agent plans tool calls, executes them (read/write/edit/search files inside the workspace only), and reports back with live status updates.

## ✅ Next Steps

- [User Guide](/docs/user-guide/) — everything the app can do
- [Addon Development](/docs/addon-development/) — extend GGUF Loader with addons

---
title: "Contributing Guide"
description: "How to contribute to GGUF Loader development"
permalink: /docs/contributing/
layout: docs
toc: true
tags: ["contributing", "development", "open-source", "community"]
related_docs: ["addon-development", "package-structure", "addon-api"]
difficulty: "intermediate"
reading_time: "10 minutes"
---

# Contributing Guide

Thank you for contributing to GGUF Loader! This guide covers how to set up a development environment, make changes, and get them merged. See the project's [`CONTRIBUTING.md`](https://github.com/GGUFloader/gguf-loader/blob/main/CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](https://github.com/GGUFloader/gguf-loader/blob/main/CODE_OF_CONDUCT.MD) for the canonical rules.

## 🛠️ Setting Up Development

```bash
git clone https://github.com/GGUFloader/gguf-loader.git
cd gguf-loader
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```

The sidebar's **Create .venv & Restart** button does this for you if you prefer not to use the terminal.

## 🧭 Codebase Orientation

- `core/` — pure logic (no Qt): model backend, prompt builder, agent engine, tools
- `services/` — Qt threading bridges (model, chat, agent, environment)
- `ui/` + `widgets/` — presentation: main window, panels, bubbles
- `addons/` — addon packages (see the [Addon Development Guide](/docs/addon-development/))
- `scripts/` — utility and release scripts
- `resource_manager.py` — path resolution across dev/package/frozen deployments

## ✅ Before You Submit

### Style
- Follow the existing conventions (4-space indent, docstrings on modules/classes, type hints where helpful).
- Keep the layering rule: **no Qt in `core/`**, **no threads outside `services/`**, **dumb widgets**.

### Check
- Run the app from source and verify your change (`python main.py`).
- The app is Qt-based — there is no automated test suite yet, so manual verification plus clear console logging matters.
- If you changed UI, re-run `scripts/capture_screenshots.py` and commit the refreshed `screen.png` so the README/site stay current.

### Commit
- Write a clear, concise commit message describing *why* (e.g. "Prevent floating button from staying minimized after Win+D").

## 🐛 Reporting Issues

Open an issue at [github.com/GGUFloader/gguf-loader/issues](https://github.com/GGUFloader/gguf-loader/issues) with:

- App version (Help → About, or `main.py --version`)
- OS and whether you're on CPU or GPU
- The model file you were using
- Relevant log lines (see [Troubleshooting](/docs/troubleshooting/#where-to-find-logs))
- Steps to reproduce

## 🧩 Contributing Addons

Addons don't need to touch the core app at all. Publish your addon as a folder matching the [addon contract](/docs/addon-api/#addon-contract), and share it in an issue or discussion so it can be listed in the community.

## 🚀 Releasing (maintainers)

Releases are built automatically by GitHub Actions when a `v*` tag is pushed:

1. Bump the version in `__init__.py` and `build_exe.spec`.
2. Update `CHANGELOG.md`.
3. Tag and push: `git tag v2.1.3 && git push origin v2.1.3`.
4. The workflow attaches the Windows `.exe` and Linux binary to the release; optionally add the `.tar.gz` (built via `scripts/package_linux.sh`) and a `screen.png`.

## 💬 Questions?

Start a [GitHub Discussion](https://github.com/GGUFloader/gguf-loader/discussions) — the community and maintainers are happy to help.

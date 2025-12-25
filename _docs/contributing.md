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

Thank you for your interest in contributing to GGUF Loader! This guide will help you get started.

## 🎯 Ways to Contribute

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Addon development

### Non-Code Contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Community support
- Translations

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Git
- GitHub account
- Basic understanding of Qt/PySide6 (for UI work)

### Development Setup

1. **Fork the repository**
   ```bash
   # Visit https://github.com/gguf-loader/gguf-loader
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gguf-loader.git
   cd gguf-loader
   ```

3. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   ```


4. **Install dependencies**
   ```bash
   pip install -e .[dev]
   ```

5. **Run tests**
   ```bash
   pytest
   ```

## 📝 Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-addon` - New features
- `fix/model-loading-error` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/cleanup-ui` - Code refactoring

### Commit Messages

Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(addon): add text translation addon
fix(model): resolve memory leak on model unload
docs(readme): update installation instructions
```

### Code Style

- Follow PEP 8 for Python code
- Use type hints where possible
- Write docstrings for public functions
- Keep functions focused and small

## 🔍 Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

4. **Open Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the template
   - Request review

### PR Requirements

- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)
- [ ] No merge conflicts

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_model_loader.py

# Run with coverage
pytest --cov=gguf_loader
```

### Writing Tests

```python
import pytest
from gguf_loader.model_loader import ModelLoader

class TestModelLoader:
    def test_load_valid_model(self):
        loader = ModelLoader()
        # Test implementation
        
    def test_load_invalid_model(self):
        loader = ModelLoader()
        with pytest.raises(ValueError):
            loader.load("invalid.txt")
```

## 📚 Documentation

### Updating Docs

Documentation lives in `_docs/`:
- Use Markdown format
- Include front matter
- Add to navigation if new page
- Test locally with Jekyll

### Doc Style Guide

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Link to related documentation

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Try latest version
3. Reproduce the bug
4. Gather system info

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**System Info**
- OS: 
- Python version:
- GGUF Loader version:
- Model used:

**Screenshots/Logs**
If applicable
```

## 💡 Feature Requests

### Before Requesting

1. Check existing requests
2. Consider if it fits the project
3. Think about implementation

### Feature Request Template

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought of

**Additional Context**
Any other information
```

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 📞 Getting Help

- **Questions**: Use GitHub Discussions
- **Bugs**: Open GitHub Issue
- **Security**: Email security@ggufloader.com
- **General**: support@ggufloader.com

## 📚 Related Documentation

- [Addon Development](/docs/addon-development/ "Create addons") - Build addons
- [Package Structure](/docs/package-structure/ "Code organization") - Understand codebase
- [API Reference](/docs/addon-api/ "API docs") - Technical reference

---

**Thank you for contributing to GGUF Loader! Your help makes this project better for everyone. 🙏**

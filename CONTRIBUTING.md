# Contributing to GGUF Loader

Thank you for your interest in contributing to GGUF Loader! We welcome contributions from developers of all skill levels and backgrounds. This document provides guidelines and information to help you contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community Support](#community-support)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

### Our Standards

- **Be Respectful**: Treat all community members with respect and kindness
- **Be Inclusive**: Welcome developers of all skill levels and backgrounds
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is learning and growing
- **Be Professional**: Maintain a professional tone in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Spam or off-topic discussions
- Sharing private information without permission

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Git version control system
- GitHub account
- Code editor (VS Code, PyCharm, etc.)

### First Steps

1. **Star the Repository**: Show your support by starring the [GGUF Loader repository](https://github.com/ggufloader/gguf-loader)
2. **Join Discussions**: Participate in [GitHub Discussions](https://github.com/ggufloader/gguf-loader/discussions)
3. **Read Documentation**: Familiarize yourself with the [documentation](/docs/)
4. **Explore Issues**: Look for [good first issues](https://github.com/ggufloader/gguf-loader/labels/good%20first%20issue)

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/gguf-loader.git
cd gguf-loader

# Add upstream remote
git remote add upstream https://github.com/ggufloader/gguf-loader.git
```

### 2. Set Up Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Verify Setup

```bash
# Run tests to ensure everything works
python -m pytest

# Run the application
python -m ggufloader
```

## Contributing Process

### 1. Choose What to Work On

- **Bug Fixes**: Check [open issues](https://github.com/ggufloader/gguf-loader/issues)
- **New Features**: Discuss in [GitHub Discussions](https://github.com/ggufloader/gguf-loader/discussions) first
- **Documentation**: Improve existing docs or add new guides
- **Addons**: Create new addons or improve existing ones

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### 3. Make Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_your_feature.py

# Run with coverage
python -m pytest --cov=ggufloader

# Test addon functionality
python -m ggufloader --test-addon your_addon
```

### 5. Submit Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Include:
# - Clear description of changes
# - Link to related issues
# - Screenshots if UI changes
# - Testing instructions
```

## Coding Standards

### Python Style

- Follow [PEP 8](https://pep8.org/) style guide
- Use [Black](https://black.readthedocs.io/) for code formatting
- Use [isort](https://pycqa.github.io/isort/) for import sorting
- Use [flake8](https://flake8.pycqa.org/) for linting

```bash
# Format code
black .
isort .

# Check linting
flake8 .
```

### Code Organization

```python
# File structure example
"""
Module docstring describing purpose and usage.
"""

import standard_library
import third_party_library

from ggufloader import local_module

# Constants
DEFAULT_TIMEOUT = 30

# Classes and functions with proper docstrings
class ExampleClass:
    """Class docstring with description and usage examples."""
    
    def __init__(self, param: str) -> None:
        """Initialize with parameter."""
        self.param = param
    
    def method_name(self, arg: int) -> str:
        """Method docstring with parameters and return value."""
        return f"{self.param}: {arg}"
```

### Documentation Strings

```python
def function_name(param1: str, param2: int = 10) -> bool:
    """
    Brief description of function purpose.
    
    Longer description if needed, explaining the function's behavior,
    use cases, and any important details.
    
    Args:
        param1: Description of first parameter
        param2: Description of second parameter with default value
    
    Returns:
        Description of return value
    
    Raises:
        ValueError: When param1 is empty
        TypeError: When param2 is not an integer
    
    Example:
        >>> result = function_name("hello", 5)
        >>> print(result)
        True
    """
    if not param1:
        raise ValueError("param1 cannot be empty")
    
    return len(param1) > param2
```

## Testing Guidelines

### Test Structure

```python
import pytest
from unittest.mock import Mock, patch

from ggufloader.module import function_to_test

class TestFunctionName:
    """Test class for function_name."""
    
    def test_normal_case(self):
        """Test normal operation."""
        result = function_to_test("input")
        assert result == "expected_output"
    
    def test_edge_case(self):
        """Test edge case handling."""
        with pytest.raises(ValueError):
            function_to_test("")
    
    @patch('ggufloader.module.external_dependency')
    def test_with_mock(self, mock_dependency):
        """Test with mocked dependencies."""
        mock_dependency.return_value = "mocked_result"
        result = function_to_test("input")
        assert result == "expected_with_mock"
```

### Test Categories

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **Addon Tests**: Test addon functionality and API
- **Performance Tests**: Test performance-critical code

### Running Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_specific.py

# Run tests matching pattern
python -m pytest -k "test_pattern"

# Run with coverage report
python -m pytest --cov=ggufloader --cov-report=html
```

## Documentation

### Types of Documentation

1. **Code Documentation**: Docstrings and inline comments
2. **User Documentation**: Guides and tutorials in `/docs/`
3. **API Documentation**: Auto-generated from docstrings
4. **README Files**: Project and module overviews

### Writing Guidelines

- Use clear, concise language
- Include practical examples
- Keep documentation up-to-date with code changes
- Use proper Markdown formatting
- Include screenshots for UI features

### Documentation Structure

```
docs/
├── installation.md          # Installation guide
├── quick-start.md          # Getting started guide
├── addon-development.md    # Addon development guide
├── addon-api.md           # API reference
├── smart-floater-example.md # Example addon
├── package-structure.md    # Technical documentation
└── troubleshooting.md     # Common issues and solutions
```

## Addon Development

### Creating New Addons

1. **Plan Your Addon**: Define purpose and functionality
2. **Follow API**: Use the addon API consistently
3. **Include Tests**: Write comprehensive tests
4. **Document Usage**: Provide clear documentation
5. **Submit for Review**: Follow the contribution process

### Addon Structure

```
addons/
└── your_addon/
    ├── __init__.py
    ├── main.py              # Main addon logic
    ├── config.py           # Configuration handling
    ├── tests/              # Addon tests
    │   └── test_main.py
    ├── docs/               # Addon documentation
    │   └── README.md
    └── requirements.txt    # Addon dependencies
```

### Addon API Guidelines

```python
from ggufloader.addon import AddonBase, addon_method

class YourAddon(AddonBase):
    """Your addon description."""
    
    name = "Your Addon Name"
    version = "1.0.0"
    description = "Brief description of functionality"
    
    def __init__(self):
        super().__init__()
        self.setup_addon()
    
    @addon_method
    def process_text(self, text: str) -> str:
        """Process text with your addon logic."""
        # Your implementation here
        return processed_text
    
    def setup_addon(self):
        """Initialize addon resources."""
        pass
    
    def cleanup(self):
        """Clean up addon resources."""
        pass
```

## Community Support

### Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Documentation**: Check existing guides and tutorials
- **Community**: Connect with other developers

### Providing Help

- **Answer Questions**: Help other community members
- **Review Pull Requests**: Provide constructive feedback
- **Improve Documentation**: Fix errors and add examples
- **Share Knowledge**: Write tutorials and guides

### Communication Channels

- **GitHub Discussions**: General discussions and Q&A
- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code review and collaboration
- **Documentation**: Guides and tutorials

## Recognition

We appreciate all contributions to GGUF Loader! Contributors are recognized in:

- **Contributors List**: Listed in repository contributors
- **Release Notes**: Mentioned in version release notes
- **Documentation**: Credited in relevant documentation
- **Community**: Highlighted in community discussions

## Questions?

If you have questions about contributing, please:

1. Check this document and existing documentation
2. Search [GitHub Discussions](https://github.com/ggufloader/gguf-loader/discussions)
3. Ask in the [Q&A category](https://github.com/ggufloader/gguf-loader/discussions/categories/q-a)
4. Open an issue if you found a bug

Thank you for contributing to GGUF Loader! 🚀
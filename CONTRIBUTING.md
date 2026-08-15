# Contributing to Geeked.Out Quantizer

Thank you for your interest in contributing to Geeked.Out Quantizer! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Areas for Contribution](#areas-for-contribution)

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Git**
- **PowerShell 7+** (Windows) or **Bash/Zsh** (Linux/macOS)
- **CUDA Toolkit** (optional, for GPU acceleration development)

### Setup

```bash
# Clone the repository
git clone https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer.git
cd geeked-out-quantizer

# Install dependencies
npm install

# Download llama.cpp binaries
.\scripts\download-binaries.ps1

# Start development mode
npm run dev
```

## Development Workflow

### Branching Strategy

```
main          ← Production-ready code
├── feature/  ← New features
├── fix/      ← Bug fixes
├── docs/     ← Documentation updates
└── refactor/ ← Code refactoring
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add IQ2_M quantization support
fix: resolve CUDA memory leak
docs: update README with installation guide
refactor: restructure quantization engine
test: add unit tests for hardware detection
chore: update dependencies
```

### Development Commands

```bash
npm run dev          # Start development mode
npm run build        # Build the app
npm test             # Run tests
npm run lint         # Lint code
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript type checking
npm run electron:build  # Build distributables
```

## Coding Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types for object shapes
- Use descriptive variable names
- Add JSDoc comments for public APIs

### Code Style

```typescript
// ✅ Good
async function quantizeModel(params: QuantizationParams): Promise<QuantizationResult> {
  const output = await process(params);
  return { success: true, data: output };
}

// ❌ Bad
async function q(p) {
  const o = await process(p);
  return { s: true, d: o };
}
```

### Testing

- Write unit tests for new functions
- Maintain >80% code coverage
- Test edge cases and error conditions

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes with clear messages
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)

## Screenshots (if applicable)
Add screenshots of UI changes
```

## Areas for Contribution

### High Priority

- 🐛 **Bug fixes** - Report and fix issues
- 📚 **Documentation** - Improve README, add examples
- 🧪 **Tests** - Increase code coverage
- 🐧 **Linux/macOS support** - Platform-specific fixes

### Medium Priority

- ✨ **New quantization methods** - Add support for new GGUF types
- 🖥️ **UI improvements** - Enhance the Electron app
- ⚡ **Performance** - Optimize quantization pipeline
- 🎨 **Themes** - Add new visual themes

### Nice to Have

- 📊 **Metrics dashboard** - Track quantization results
- 🔔 **Notifications** - Alert on completion
- 📁 **Batch UI** - Visual batch processing interface
- 🌐 **Localization** - Support for other languages

## Questions?

- 📖 [Documentation](README.md)
- 💬 [Discussions](https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer/discussions)
- 🐛 [Issue Tracker](https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer/issues)

---

Thank you for contributing to Geeked.Out Quantizer! 🧠

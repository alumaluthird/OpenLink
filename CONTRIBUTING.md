# Contributing to OpenLink

Thank you for your interest in contributing to OpenLink! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/openlink/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Code samples if applicable
   - Environment details (OS, Node version, browser, etc.)

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear use case description
   - Proposed API/interface
   - Examples of how it would be used
   - Any alternatives you've considered

### Pull Requests

1. **Fork the repository**

2. **Clone your fork**
```bash
git clone https://github.com/yourusername/openlink.git
cd openlink
```

3. **Install dependencies**
```bash
npm install
```

4. **Create a branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

5. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation
   - Ensure all tests pass

6. **Build and test**
```bash
npm run build
npm test
```

7. **Commit your changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

8. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

9. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changes were made and why

## Development Setup

### Project Structure

```
openlink/
├── packages/
│   ├── core/          # Core SDK
│   ├── react/         # React integration
│   ├── nextjs/        # Next.js integration
│   ├── vanilla/       # Vanilla JS
│   ├── server/        # Server utilities
│   └── db/            # Database utilities
├── examples/          # Example applications
└── docs/             # Documentation
```

### Building

Build all packages:
```bash
npm run build
```

Build specific package:
```bash
cd packages/core
npm run build
```

### Development Mode

Watch for changes:
```bash
npm run dev
```

### Testing

Run tests:
```bash
npm test
```

Run tests for specific package:
```bash
cd packages/core
npm test
```

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### TypeScript

- Always define types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types alongside implementations

### React

- Use functional components
- Use hooks for state and side effects
- Keep components focused on single responsibility
- Extract reusable logic into custom hooks

### Documentation

- Update README files when adding features
- Add JSDoc comments to public APIs
- Include code examples in documentation
- Keep examples up to date

## Package Guidelines

### Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with:
   - Appropriate name (`@openlink/package-name`)
   - Dependencies
   - Build scripts
3. Add `tsconfig.json`
4. Add `README.md` with usage examples
5. Update root `package.json` workspaces if needed

### Package Dependencies

- Keep dependencies minimal
- Use peer dependencies for common libraries (React, etc.)
- Don't duplicate dependencies across packages
- Update all packages when updating shared dependencies

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Scope:**
- Package name: `core`, `react`, `nextjs`, etc.
- Or feature area

**Examples:**
```
feat(core): add support for additional wallet adapters

fix(react): resolve hook dependency issue in useWallet

docs(db): add PostgreSQL migration example

chore: update dependencies
```

## Release Process

(For maintainers)

1. Update version in all `package.json` files
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Publish to npm

## Questions?

- Check existing documentation
- Search closed issues
- Ask in [Discussions](https://github.com/yourusername/openlink/discussions)
- Reach out on [Discord](https://discord.gg/openlink)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to OpenLink! 🚀


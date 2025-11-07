# Contributing to CodeReview AI

Thank you for your interest in contributing to CodeReview AI! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/ai-code-review-team/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version, Python version)
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Update documentation
7. Commit with conventional commits: `feat: add new feature`
8. Push to your fork
9. Open a Pull Request

### Development Setup

See the [README](README.md#quick-start) for installation instructions.

### Code Style

**Frontend (TypeScript/React):**
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful component names
- Add JSDoc comments for complex functions

**Backend (Python):**
- Follow PEP 8
- Use Black for formatting
- Use type hints
- Add docstrings

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Testing

**Frontend:**
```bash
cd frontend
npm test
npm run lint
```

**Backend:**
```bash
cd backend
pytest
pylint **/*.py
```

## Questions?

Feel free to ask questions in [Discussions](https://github.com/yourusername/ai-code-review-team/discussions) or create an issue.

Thank you for contributing! 🎉

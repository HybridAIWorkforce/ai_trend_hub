# Contributing to AI Trend Hub

Thank you for your interest in contributing to AI Trend Hub! We welcome contributions from the community and are grateful for your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to:
- Being respectful and inclusive
- Welcoming newcomers
- Focusing on constructive feedback
- Prioritizing the community's well-being

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- Yarn package manager
- PostgreSQL (for local database)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/HybridAIWorkforce/ai_trend_hub.git
cd ai_trend_hub

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npx prisma migrate dev
npx prisma generate

# Run the development server
yarn dev
```

### Docker Setup

Alternatively, you can use Docker for development:

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow conventional commit format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build process, dependencies, etc.

Examples:
```
feat(auth): add OAuth2 login support

fix(api): resolve race condition in data fetch

docs(readme): update installation instructions
```

## Submitting Changes

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure tests pass** by running `yarn test`
4. **Update the CHANGELOG.md** with your changes
5. **Fill out the PR template** completely
6. **Request review** from maintainers

### PR Review Criteria

Your PR will be reviewed for:
- Code quality and style
- Test coverage
- Documentation completeness
- Performance impact
- Security considerations

### Before Submitting

Run these commands to ensure quality:

```bash
# Lint your code
yarn lint

# Type check
yarn type-check

# Run tests
yarn test

# Build the project
yarn build
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Avoid `any` types when possible

### React Components

- Use functional components with hooks
- Use meaningful component names
- Keep components focused and small
- Use proper prop typing

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Avoid inline styles
- Use CSS modules for component-specific styles

### File Organization

```
app/
├── (routes)/           # Route groups
├── api/                # API routes
├── layout.tsx          # Root layout
└── page.tsx            # Home page

components/
├── ui/                 # Reusable UI components
├── layout/             # Layout components
└── forms/              # Form components

lib/
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── services/           # API service functions

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Writing Tests

- Write unit tests for utilities and hooks
- Write integration tests for API routes
- Write E2E tests for critical user flows
- Mock external dependencies
- Aim for meaningful test coverage

### Test File Structure

```
component.tsx
component.test.tsx        # Unit tests
component.integration.test.tsx  # Integration tests
```

## Documentation

### Code Documentation

- Document complex logic with comments
- Use JSDoc for functions and components
- Include examples where helpful

### README Updates

Update README.md if you:
- Add new features
- Change the installation process
- Modify environment variables
- Update dependencies

### API Documentation

Document API endpoints in:
- Code comments
- API route files
- External documentation (if applicable)

## Questions?

- Check existing [issues](https://github.com/HybridAIWorkforce/ai_trend_hub/issues)
- Start a [discussion](https://github.com/HybridAIWorkforce/ai_trend_hub/discussions)
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to AI Trend Hub! 🚀

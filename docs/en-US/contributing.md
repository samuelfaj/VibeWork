# Contributing Guide

Guidelines for contributing to VibeWork.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create feature branch: `git checkout -b feature/my-feature`
4. Make changes
5. Run tests and linting
6. Commit with conventional commit message
7. Push and create pull request

## Development Workflow

### Create Feature Branch

```bash
git checkout -b feature/add-notifications
# or
git checkout -b fix/auth-bug
# or
git checkout -b docs/update-readme
```

**Branch naming:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Test additions
- `chore/` - Build, dependencies, etc.

### Make Changes

Follow project structure and conventions:

- Create files in appropriate directories
- Follow naming conventions (PascalCase for components, camelCase for utils)
- Add tests alongside code
- Update documentation if needed

### Test Locally

Before committing, verify everything works:

```bash
# Unit tests
bun run test

# Integration tests
bun run test:integration

# Linting
bun run lint
bun run lint:fix

# Type checking
bun run typecheck

# Formatting
bun run format

# E2E tests
bun run test:e2e

# All checks
bun run lint && bun run typecheck && bun run test && bun run test:integration
```

## Commit Messages

Use conventional commit format:

```
type(scope): subject

body

footer
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature or fix
- **perf**: Performance improvement
- **test**: Test addition or update
- **chore**: Build, dependencies, config

### Examples

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(notifications): correct email template formatting"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(database): optimize query performance"
git commit -m "test(user-service): add unit tests"
git commit -m "chore: upgrade dependencies"
```

### With Body

```bash
git commit -m "feat(user): implement email verification

- Add email verification flow
- Create verification token service
- Add email sending via SES

Closes #123"
```

## Code Style

### TypeScript

- Use strict mode
- Explicit types (avoid `any`)
- No unused variables
- Export interfaces

```typescript
// Good
export interface UserResponse {
  id: string
  email: string
  name: string
}

export async function getUser(id: string): Promise<UserResponse> {
  // implementation
}

// Avoid
export async function getUser(id: any): Promise<any> {
  // implementation
}
```

### React Components

- Functional components with hooks
- Custom hooks for logic
- Props interface
- Export types

```typescript
// Good
interface LoginFormProps {
  onSuccess?: () => void
  loading?: boolean
}

export const LoginForm = ({ onSuccess, loading }: LoginFormProps) => {
  // implementation
}

// Avoid
export const LoginForm = (props: any) => {
  // implementation
}
```

### File Organization

```
feature/
├── Component.tsx       # Component
├── Component.module.css # Styles
├── hooks.ts           # Custom hooks
├── types.ts           # Type definitions
├── index.ts           # Barrel export
└── __tests__/         # Tests
```

## Testing Requirements

### Test Coverage

- **Minimum**: 80% coverage
- **Critical paths**: 100% coverage
- **New code**: Should have tests

```bash
bun run test:coverage
# Check coverage/index.html
```

### Test Structure

```typescript
// Good: Arrange-Act-Assert
describe('LoginForm', () => {
  it('should submit with valid credentials', async () => {
    // Arrange
    const mockOnSuccess = vi.fn()
    const { getByRole } = render(
      <LoginForm onSuccess={mockOnSuccess} />
    )

    // Act
    const emailInput = getByRole('textbox', { name: /email/i })
    const submitButton = getByRole('button', { name: /login/i })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})
```

## Pull Request Process

### Before Creating PR

1. Ensure all tests pass
2. Ensure no linting errors
3. Ensure types check
4. Update documentation if needed
5. Add changelog entry if applicable

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Tests pass (`bun run test`)
- [ ] No type errors (`bun run typecheck`)
- [ ] No linting errors (`bun run lint`)
- [ ] Code formatted (`bun run format`)
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages follow convention

## Related Issues

Closes #123

## Screenshots (if applicable)

[Add screenshots for UI changes]
```

### Code Review Process

1. Automated checks (tests, linting, types)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

### PR Review Checklist

Reviewers check:

- Code correctness
- Test coverage
- Documentation
- Performance impact
- Security implications
- Breaking changes

## Documentation

### Writing Documentation

1. Use clear, concise language
2. Include code examples
3. Explain "why" not just "how"
4. Keep up-to-date with code changes

### Documentation Files

- **CLAUDE.md**: Project-specific documentation
- **README.md**: Getting started guide
- **docs/**: Comprehensive guides
- **Inline comments**: Complex logic only

## Issues and Discussions

### Reporting Issues

When reporting a bug:

1. Clear title
2. Description of issue
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Environment info

Example:

```markdown
## Bug: Login fails with special characters in password

### Description

Users cannot log in when password contains special characters like @, #, $.

### Steps to Reproduce

1. Go to signup page
2. Enter password: `test@#$`
3. Click submit
4. Get error message

### Expected

Should log in successfully

### Actual

Error: "Invalid password"

### Environment

- OS: macOS 14.0
- Browser: Chrome 120
- Backend: localhost:3000
```

## Performance Guidelines

### Frontend

- Keep components focused (200 lines max)
- Memoize expensive computations
- Lazy load non-critical routes
- Optimize images
- Monitor bundle size

### Backend

- Add database indexes for queries
- Cache expensive operations
- Implement pagination
- Monitor query performance
- Use connection pooling

## Security Guidelines

### Do's

- ✅ Validate all inputs
- ✅ Hash passwords
- ✅ Use HTTPS
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Sanitize user content
- ✅ Use prepared statements

### Don'ts

- ❌ Store passwords plain-text
- ❌ Expose sensitive data in logs
- ❌ Commit credentials
- ❌ Use `eval()` or similar
- ❌ Trust user input
- ❌ Skip CSRF protection
- ❌ Ignore security warnings

## Dependency Updates

### Adding Dependencies

```bash
# Add to package
bun add <package>
bun add -D <dev-package>

# Test compatibility
bun run test
bun run typecheck

# Commit
git add package.json bun.lockb
git commit -m "chore: add <package>"
```

### Updating Dependencies

```bash
# Check outdated packages
bun update --check

# Update all
bun update

# Or update specific
bun update <package>

# Run tests to verify
bun run test
```

## Communication

### Getting Help

- Check documentation first
- Search existing issues
- Ask in discussions
- Open an issue if needed

### Discussions

Use discussions for:

- Design decisions
- Feature ideas
- Questions
- General feedback

## Code of Conduct

We are committed to providing a welcoming and inclusive environment.

- Treat everyone with respect
- Welcome diverse perspectives
- Be constructive in criticism
- Report harassment or unacceptable behavior

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes (if applicable)

---

**Last Updated**: December 2024

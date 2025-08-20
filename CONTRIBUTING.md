# Contributing to Fusion X

Thank you for considering contributing to Fusion X! We welcome contributions from the community to help make this platform even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Prioritize the community's best interests

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14+
- Git
- VS Code (recommended) or your preferred IDE

### Installation

```bash
# Clone your fork
git clone https://github.com/yourusername/fusion-x.git
cd fusion-x

# Add upstream remote
git remote add upstream https://github.com/original/fusion-x.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Initialize database
npm run db:push

# Start development server
npm run dev
```

## How to Contribute

### Reporting Bugs

- Check existing issues first
- Use the bug report template
- Include reproduction steps
- Provide system information
- Add relevant logs or screenshots

### Suggesting Features

- Check the roadmap and existing issues
- Use the feature request template
- Explain the use case clearly
- Consider implementation complexity
- Be open to discussion

### Code Contributions

1. **Find an Issue**
   - Look for "good first issue" labels
   - Comment on the issue to claim it
   - Ask questions if needed

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

3. **Make Changes**
   - Follow coding standards
   - Write tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

## Pull Request Process

1. **Before Submitting**
   - Sync with upstream main
   - Resolve any conflicts
   - Ensure all tests pass
   - Update documentation

2. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

3. **Review Process**
   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Be patient and professional

## Coding Standards

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userProfile = await getUserProfile(userId);

// Prefer const over let
const MAX_RETRIES = 3;

// Use async/await over promises
async function fetchData() {
  try {
    const data = await api.get('/endpoint');
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Document complex functions
/**
 * Calculates the final score for a submission
 * @param scores - Array of individual scores
 * @param weights - Scoring weights for each criterion
 * @returns Weighted average score
 */
function calculateFinalScore(scores: number[], weights: number[]): number {
  // Implementation
}
```

### React Components

```tsx
// Use functional components with TypeScript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function SubmissionForm({ title, onSubmit }: Props) {
  // Component logic
}

// Use proper hooks
import { useState, useEffect, useMemo } from 'react';

// Extract custom hooks
function useSubmission(id: string) {
  // Hook logic
}
```

### CSS/Styling

```css
/* Use Tailwind utilities */
<div className="flex items-center justify-between p-4">

/* Custom CSS when needed */
.custom-component {
  /* Use CSS variables for theming */
  background: var(--background);
  color: var(--foreground);
}
```

## Commit Guidelines

Follow the Conventional Commits specification:

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(auth): add Firebase authentication
fix(submissions): resolve file upload error
docs(readme): update installation instructions
style(dashboard): improve responsive layout
refactor(api): optimize database queries
test(teams): add unit tests for team creation
chore(deps): update dependencies
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Testing

### Unit Tests

```typescript
// Example test file: team.test.ts
import { describe, it, expect } from 'vitest';
import { createTeam, joinTeam } from './team';

describe('Team Management', () => {
  it('should create a new team', async () => {
    const team = await createTeam({
      name: 'Test Team',
      eventId: 1
    });
    
    expect(team).toBeDefined();
    expect(team.name).toBe('Test Team');
  });
  
  it('should allow joining with valid code', async () => {
    const result = await joinTeam('ABC123');
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
// API endpoint testing
import request from 'supertest';
import app from '../server';

describe('POST /api/submissions', () => {
  it('should create a submission', async () => {
    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Test Project',
        description: 'Test description'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Project');
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document component props with TypeScript
- Include examples for complex usage

### README Updates

- Update feature list when adding features
- Keep environment variables current
- Update API documentation

### Architecture Documentation

- Document significant architectural changes
- Update diagrams when needed
- Explain design decisions

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/index.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## Release Process

1. **Version Bump**
   ```bash
   npm version patch|minor|major
   ```

2. **Changelog Update**
   - Document all changes
   - Include breaking changes
   - Credit contributors

3. **Tag Release**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

## Getting Help

- Join our Discord server
- Check the FAQ in discussions
- Ask questions in issues
- Email: support@fusion-x.dev

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor spotlight

Thank you for contributing to Fusion X! 🚀
# Contributing to LedgerMind

Thank you for your interest in contributing to LedgerMind! 🎉

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why this enhancement would be useful
- **Possible implementation** (if you have ideas)
- **Screenshots/mockups** (if applicable)

### Pull Requests

1. **Fork the repository**
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the coding style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Request review

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account
- Google AI API key

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/ledgermind.git
   cd ledgermind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - prefer `unknown` with type guards
- Define interfaces for complex objects
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### Styling

- Use TailwindCSS utility classes
- Follow existing color scheme (green theme)
- Ensure responsive design (mobile-first)
- Test in both light and dark modes

### File Organization

```
- Components go in /components
- API routes go in /app/api
- Pages go in /app
- Utilities go in /lib
- Types can be inline or in /types
```

### Naming Conventions

- **Files:** kebab-case (`receipt-card.tsx`)
- **Components:** PascalCase (`ReceiptCard`)
- **Functions:** camelCase (`calculateTotal`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

## 🧪 Testing

Before submitting a PR:

1. **Test your changes manually**
   - Try different scenarios
   - Test edge cases
   - Check responsive design
   - Test in multiple browsers

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Check TypeScript**
   ```bash
   npm run type-check
   ```

4. **Test production build**
   ```bash
   npm run build
   npm start
   ```

## 📚 Documentation

- Update README.md if adding features
- Add JSDoc comments for complex functions
- Update API documentation if changing endpoints
- Include inline comments for tricky logic

## 🎨 Design Guidelines

- Follow existing UI patterns
- Use shadcn/ui components when possible
- Maintain consistent spacing and alignment
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🔒 Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Follow security best practices
- Report security vulnerabilities privately

## 📋 Commit Messages

Follow conventional commits format:

```
feat: add receipt bulk upload
fix: resolve category auto-complete bug
docs: update API documentation
style: format code with prettier
refactor: simplify receipt processing
test: add tests for analytics
chore: update dependencies
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 📞 Communication

- Be respectful and constructive
- Ask questions if unclear
- Provide context in discussions
- Help others when you can

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Acknowledged in release notes
- Appreciated by the community! ❤️

---

Thank you for making LedgerMind better! 🚀

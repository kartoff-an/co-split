# 🤝 Contributing to Co-Split

First off, thank you so much for taking the time to contribute! 🎉

Co-Split is built to be a simple, delightful, and open tool, and we welcome contributions of all shapes and sizes. Whether you're squashing bugs, adding cool new features, refining the UI, or polishing up documentation, we appreciate your help.

Here is a quick guide on how to get started and how we write code here.

---

## Code of Conduct

Be kind, respect each other, and keep things constructive. We're all here to build cool stuff together!

---

## How Can I Contribute?

### 1. Reporting Bugs
Found a bug? Tell us all about it!
*   Check if it's already reported in the [GitHub Issues](https://github.com/kartoff-an/co-split/issues).
*   If not, open a new issue with clear steps to reproduce, what you expected, and what actually happened.

### 2. Suggesting Features
Have an idea to make Co-Split even better?
*   Open an issue detailing the feature, why it would be useful, and how you imagine it working.

### 3. Writing Code (Creating a Pull Request)
Ready to write some code? Here is our workflow:
1.  **Fork** the repository and clone it locally.
2.  **Create a branch** for your work:
    *   For new features: `feature/cool-new-thing`
    *   For bug fixes: `bugfix/fix-annoying-bug`
    *   For documentation: `docs/update-something`
3.  **Make your changes.** Be sure to follow our coding styles (more on that below).
4.  **Validate your changes.** Run the formatter, linter, and build checks locally.
5.  **Submit a Pull Request (PR)** to the `main` branch. Provide a clear description of what your PR changes and any screenshots of visual edits.

---

## Coding Guidelines

To keep the codebase healthy, clean, and consistent, please follow these guidelines:

### TypeScript & React
*   Write clean, type-safe TypeScript.
*   Keep components small, reusable, and focused on a single responsibility.
*   Use custom hooks (located in [src/hooks/](https://github.com/kartoff-an/co-split/tree/main/src/hooks)) to separate business logic and state management from presentation components.

### Styling
*   We use **Tailwind CSS v4** for styling.
*   Stick to the utility classes and theme variables defined in the project's [index.css](https://github.com/kartoff-an/co-split/blob/main/src/index.css).
*   Avoid adding raw inline styles or custom CSS rules unless there's a strong reason to.

### Linting & Formatting
Before committing, make sure your code matches our style guidelines. We use ESLint and Prettier to keep code formatting uniform.

Run the formatter:
```bash
npm run format
```

Run the linter:
```bash
npm run lint
```

Ensure everything builds successfully:
```bash
npm run build
```

---

## Pull Request Checklist

Before submitting your PR, double-check that you've done the following:
*   [ ] Checked out a new branch from `main`.
*   [ ] Code builds cleanly with `npm run build`.
*   [ ] Linter runs without errors (`npm run lint`).
*   [ ] Code is formatted using `npm run format`.
*   [ ] Outlined your changes and attached screenshots/GIFs for UI changes in the PR description.

Thanks again for helping make Co-Split better! Happy hacking! 

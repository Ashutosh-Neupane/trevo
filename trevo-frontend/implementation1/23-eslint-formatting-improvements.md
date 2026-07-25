# Section 23: ESLint & Formatting Improvements

## Current State
- ESLint 9 with `eslint-config-next` (minimal config)
- No Prettier configuration
- No lint-staged or husky setup
- No import sorting rules
- No strict TypeScript ESLint rules

## Issues

### Issue L-1: Minimal ESLint Config
```javascript
// Current eslint.config.mjs is bare — just extends next/core-web-vitals
// No custom rules, no TypeScript-specific rules
```

### Issue L-2: No Prettier
- No consistent code formatting
- No `.prettierrc` configuration
- No format-on-save setup

### Issue L-3: No Pre-commit Hooks
- No lint-staged or husky
- No automatic linting/formatting on commit

## Proposed Configuration

### 1. Enhanced ESLint Config
```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      
      // React
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": "error",
      "react/no-array-index-key": "warn",
      
      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      
      // Import order
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }],
    },
  },
];

export default eslintConfig;
```

### 2. Prettier Config
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 3. Pre-commit Hooks
```json
// package.json (add)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 4. VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Implementation Priority
1. Install Prettier and related packages
2. Create Prettier config
3. Enhance ESLint config
4. Set up husky + lint-staged
5. Run initial format on entire codebase
6. Add VS Code workspace settings

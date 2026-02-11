import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

export default [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'dist/**', 'node_modules/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-unused-vars': 'off',
      'no-undef': 'warn',
      '@next/next/no-img-element': 'warn',
      // Disable rules that aren't available in this ESLint setup
      'react-hooks/exhaustive-deps': 'off',
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        ...globals.browser,
        // Node.js globals
        ...globals.node,
        // React globals
        React: 'readonly',
        JSX: 'readonly',
      }
    }
  },
  // Suppress react-hooks/exhaustive-deps errors in files that reference it
  {
    files: ['src/app/dashboard/contact-form-responses/page.js', 'src/app/gallery/[id]/page.js', 'src/components/dashboard-component/DashboardStats.js'],
    rules: {
      'react-hooks/exhaustive-deps': 'off'
    }
  }
];

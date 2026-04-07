import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
    ],
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        Element: 'readonly',
        MutationObserver: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        crypto: 'readonly',
        performance: 'readonly',
        location: 'readonly',
        history: 'readonly',
        AbortController: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        WebSocket: 'readonly',
        EventSource: 'readonly',
        Worker: 'readonly',
        Notification: 'readonly',
        AudioContext: 'readonly',
        MediaRecorder: 'readonly',
        MediaStream: 'readonly',
        screen: 'readonly',
        getComputedStyle: 'readonly',
        matchMedia: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'warn',

      // React - configuración para evitar falsos positivos
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // Desactivado para evitar warnings en componentes sin PropTypes
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-unescaped-entities': 'off', // Evita falsos positivos con comillas
      'react/display-name': 'off', // Evita warnings en componentes anónimos
      'react/jsx-key': 'warn',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'warn',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'warn',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh (HMR)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Variables - configuración permisiva
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^React$',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': 'off', // Permitir console en desarrollo
      'no-debugger': 'warn',

      // Mejores prácticas
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['warn', 'smart'], // "smart" evita falsos positivos con null checks
      curly: ['warn', 'multi-line'], // Solo requiere curly en multi-line

      // ES6+
      'arrow-body-style': 'off', // Evita cambios innecesarios
      'prefer-arrow-callback': 'off', // Evita falsos positivos
      'prefer-template': 'off', // Opcional, no forzar

      // Evitar errores comunes
      'no-undef': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-func-assign': 'error',
      'no-irregular-whitespace': 'warn',
      'no-unreachable': 'error',
      'valid-typeof': 'error',
    },
  },
]

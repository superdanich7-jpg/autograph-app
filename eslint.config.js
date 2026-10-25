// ESLint 9 flat config на базе официального expo-пресета (R-14).
const expoFlat = require('eslint-config-expo/flat');

module.exports = [
  ...expoFlat,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.expo/**',
      'supabase/functions/**', // Deno-рантайм, отдельный tsconfig
      'scripts/**', // разовые DevOps-скрипты
      '**/*.test.*', // тесты пишутся свободнее
      'tasks/**',
    ],
  },
  {
    rules: {
      // Проектные решения (не отключать):
      'import/no-unresolved': 'off', // metro-алиасы и ассеты резолвятся бандлером, не node
      'react-hooks/exhaustive-deps': 'warn', // предупреждать, но не блокировать
      // React Compiler-правила (v6): legacy-паттерн PostsContext (refs в рендере)
      // и синхронный setState в effect — задокументированный техдолг (BUG-10),
      // рефакторинг после MVP-тега.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Тесты и jest-инфраструктура: глобалы jest
    files: ['**/__tests__/**/*', '**/*.test.*', 'jest.setup.js', 'jest.config.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
];

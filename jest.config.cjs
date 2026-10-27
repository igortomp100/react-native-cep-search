module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/services/enderecos.ts',
    'src/hooks/useEnderecoStore.ts',
  ],
  coverageDirectory: 'coverage',
};

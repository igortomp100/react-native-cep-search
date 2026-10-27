const jestApi = require('@jest/globals').jest;

jestApi.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

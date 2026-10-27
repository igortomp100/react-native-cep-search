import { configureFonts, MD3LightTheme } from 'react-native-paper';
import { radii, typography } from './tokens';

export const appTheme = {
  ...MD3LightTheme,
  roundness: radii.paper,
  fonts: configureFonts({
    config: {
      bodyMedium: typography.bodyMedium,
      bodyLarge: typography.inputLabel,
      headlineSmall: { fontWeight: typography.strong },
      headlineMedium: { fontWeight: typography.strong },
      titleLarge: { fontWeight: typography.strong },
    },
  }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#174ea6',
    onPrimary: '#ffffff',
    primaryContainer: '#dce8ff',
    onPrimaryContainer: '#102c58',
    secondary: '#426659',
    secondaryContainer: '#d6ebdf',
    onSecondaryContainer: '#163c2d',
    background: '#f6f8fc',
    surface: '#ffffff',
    surfaceVariant: '#e9edf5',
    onSurface: '#18253b',
    onSurfaceVariant: '#475467',
    outline: '#78869c',
    outlineVariant: '#dce2eb',
    error: '#b42318',
    errorContainer: '#ffdad6',
    surfaceDisabled: 'rgba(24, 37, 59, 0.12)',
    onSurfaceDisabled: 'rgba(24, 37, 59, 0.38)',
    backdrop: 'rgba(24, 37, 59, 0.4)',
    elevation: {
      level0: 'transparent',
      level1: '#f2f5fb',
      level2: '#ebf0f9',
      level3: '#e3ebf7',
      level4: '#dfe8f6',
      level5: '#d8e3f3',
    },
  },
};

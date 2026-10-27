import type { ComponentProps } from 'react';
import { Text as PaperText, useTheme } from 'react-native-paper';

type Props = ComponentProps<typeof PaperText> & {
  tone?: 'default' | 'secondary' | 'primary' | 'error';
};

export function AppText({ tone = 'default', variant = 'bodyMedium', style, ...props }: Props) {
  const theme = useTheme();
  const colors = {
    default: theme.colors.onSurface,
    secondary: theme.colors.onSurfaceVariant,
    primary: theme.colors.primary,
    error: theme.colors.error,
  };
  return <PaperText {...props} variant={variant} style={[{ color: colors[tone] }, style]} />;
}

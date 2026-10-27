import type { ComponentProps } from 'react';
import { Card, useTheme } from 'react-native-paper';

type Props = ComponentProps<typeof Card>;

export function AppCard({ style, ...props }: Props) {
  const theme = useTheme();
  return <Card {...props} style={[{ backgroundColor: theme.colors.surface }, style]} />;
}

// Medidas compartilhadas. Estilos locais devem cuidar apenas da disposição específica.
export const spacing = {
  xxs: 2,
  xs: 4,
  compact: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const layout = { contentMaxWidth: 760, headerMaxWidth: 960 } as const;
export const radii = { paper: 3, control: 12, segmented: 24 } as const;
export const sizes = {
  brandIcon: 40,
  buttonHeight: 48,
  inputHeight: 56,
  modeHeight: 96,
  modeIcon: 26,
  actionIcon: 24,
  homeAvatar: 48,
  locationAvatar: 56,
  menuMaxHeight: 288,
  menuMinWidth: 280,
} as const;
export const opacity = { disabled: 0.3 } as const;

export const typography = {
  strong: '700',
  bodyMedium: { fontSize: 14, lineHeight: 22 },
  compactLabel: { fontSize: 13, lineHeight: 18 },
  inputLabel: { fontSize: 16, lineHeight: 24 },
} as const;

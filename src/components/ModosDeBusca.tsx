import { opacity, radii, sizes, spacing, typography } from '../theme/tokens';
import { AppText } from './AppText';
import { StyleSheet, View } from "react-native";
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

const modos = [
  { value: "cep", label: "CEP", texto: "CEP", icon: "numeric" },
  {
    value: "endereco",
    label: "endereço",
    texto: "endereço",
    icon: "map-marker-outline",
  },
  {
    value: "localizacao",
    label: "localização",
    texto: "localização",
    icon: "crosshairs-gps",
  },
];

type Props = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function ModosDeBusca({ value, disabled, onChange }: Props) {
  const theme = useTheme();
  return (
    <>
      <AppText
        variant="bodyMedium"
        tone="secondary"
      >
        Buscar por:
      </AppText>
      <View style={[styles.container, { borderColor: theme.colors.outline }]}>
        {modos.map((modo, index) => {
          const selected = value === modo.value;
          const color = selected
            ? theme.colors.onSecondaryContainer
            : theme.colors.onSurface;
          return (
            <TouchableRipple
              key={modo.value}
              accessibilityRole="button"
              accessibilityLabel={modo.label}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(modo.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected
                    ? theme.colors.secondaryContainer
                    : theme.colors.surface,
                  borderLeftWidth: index ? 1 : 0,
                  borderColor: theme.colors.outline,
                  opacity: disabled ? opacity.disabled : 1,
                },
              ]}
            >
              <View style={styles.content} pointerEvents="none">
                <Icon source={modo.icon} size={sizes.modeIcon} color={color} />
                <AppText
                  variant="labelLarge"
                  numberOfLines={2}
                  style={[styles.label, { color }]}
                >
                  {modo.texto}
                </AppText>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
container: { flexDirection: 'row', borderWidth: 1, borderRadius: radii.segmented, overflow: 'hidden' },
  option: { flex: 1, minHeight: sizes.modeHeight, justifyContent: 'center', paddingHorizontal: spacing.compact, paddingVertical: spacing.md },
  content: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  label: { ...typography.compactLabel, textAlign: 'center' },
});

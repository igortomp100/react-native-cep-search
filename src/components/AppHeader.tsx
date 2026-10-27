import { layout, sizes, spacing, typography } from '../theme/tokens';
import { AppText } from './AppText';
import { router, usePathname } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { Appbar, Button, useTheme } from 'react-native-paper';

export function AppHeader() {
  const pathname = usePathname();
  const theme = useTheme();
  return (
    <Appbar.Header mode="small" elevated style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <Image source={require('../../assets/brand/guardar-cep-mark.png')} style={styles.brandIcon} resizeMode="contain" accessible={false} />
          <AppText variant="titleMedium" tone="primary" style={styles.brandName}>
            Guardar CEP
          </AppText>
        </View>
        <View style={styles.navigation}>
          <Button
            compact
            mode={pathname === "/" ? "contained-tonal" : "text"}
            accessibilityState={{ selected: pathname === "/" }}
            onPress={() => router.navigate("/")}
          >
            Home
          </Button>
          <AppText accessible={false}>|</AppText>
          <Button
            compact
            mode={pathname === "/buscarCep" ? "contained-tonal" : "text"}
            accessibilityState={{ selected: pathname === "/buscarCep" }}
            onPress={() => router.navigate("/buscarCep")}
          >
            Buscar CEP
          </Button>
        </View>
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
header: { borderBottomWidth: 1 },
  content: {
    flex: 1, width: '100%', maxWidth: layout.headerMaxWidth,
    marginHorizontal: 'auto', paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  brandIcon: { width: sizes.brandIcon, height: sizes.brandIcon },
  brandName: { fontWeight: typography.strong, flexShrink: 1 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});

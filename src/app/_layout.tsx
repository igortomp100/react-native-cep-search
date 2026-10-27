import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppHeader } from '../components/AppHeader';
import { EnderecosProvider } from '../contexts/EnderecosContext';
import { appTheme } from '../theme/appTheme';
import { sharedStyles } from '../theme/sharedStyles';

export default function RootLayout() {
  return (
    <PaperProvider theme={appTheme}>
      <EnderecosProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <AppHeader />
          <View style={sharedStyles.screen}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: appTheme.colors.background } }}>
              <Stack.Screen name="index" options={{ title: 'Home' }} />
              <Stack.Screen name="buscarCep" options={{ title: 'Buscar CEP' }} />
            </Stack>
          </View>
        </View>
      </EnderecosProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { ...sharedStyles.screen, backgroundColor: appTheme.colors.background },
});

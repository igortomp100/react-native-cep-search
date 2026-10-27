import { useState } from "react";
import { AppCard } from "../components/AppCard";
import { sharedStyles } from "../theme/sharedStyles";
import { sizes, spacing } from "../theme/tokens";
import { AppText } from "../components/AppText";
import { router } from "expo-router";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  HelperText,
  Portal,
  Snackbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnderecoCard } from "../components/EnderecoCard";
import { useEnderecos } from "../hooks/useEnderecos";
import { useCopiarTexto } from "../hooks/useCopiarTexto";
import {
  formatarCopia,
  formatarLista,
  type TipoCopia,
} from "../services/formatarEndereco";
import type { Endereco } from "../services/enderecos";

import { abrirEnderecoNoMapa } from "../services/mapas";

export default function Home() {
  const [erroMapa, setErroMapa] = useState("");
  const { enderecos, carregando, erroHistorico, recarregar } = useEnderecos();

  const { copiar, copiando, mensagem, fecharMensagem } = useCopiarTexto();

  async function abrirMapa(endereco: Endereco) {
    setErroMapa("");
    try {
      await abrirEnderecoNoMapa(endereco);
    } catch {
      setErroMapa("Não foi possível abrir o mapa. Tente novamente.");
    }
  }

  function copiarEndereco(endereco: Endereco, tipo: TipoCopia) {
    const confirmacoes = {
      cep: "CEP copiado!",
      endereco: "Endereço copiado!",
      tudo: "Endereço e CEP copiados!",
    };
    void copiar(formatarCopia(endereco, tipo), confirmacoes[tipo]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <FlatList
        data={enderecos}
        keyExtractor={(item) => item.cep}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppCard mode="contained">
              <Card.Content style={styles.content}>
                <View style={styles.heroTitle}>
                  <Image source={require('../../assets/brand/guardar-cep-mark.png')} style={styles.heroLogo} resizeMode="contain" accessible={false} />
                  <AppText variant="headlineSmall" style={styles.title}>
                    Aplicativo para guardar CEPs
                  </AppText>
                </View>
                <AppText variant="bodyMedium" tone="secondary">
                  Encontre um endereço pelo CEP ou pesquise pelo nome da rua.
                  Salve os resultados para consultar depois.
                </AppText>
                <Button
                  mode="contained"
                  icon="magnify"
                  contentStyle={styles.button}
                  style={styles.searchButton}
                  onPress={() => router.navigate("/buscarCep")}
                >
                  Buscar CEP
                </Button>
              </Card.Content>
            </AppCard>
            <View style={styles.historyHeading}>
              <View style={styles.historyTitle}>
                <AppText variant="titleLarge">Endereços salvos</AppText>
                <Chip
                  compact
                  accessibilityLabel={`${enderecos.length} endereços salvos`}
                >
                  {enderecos.length}
                </Chip>
              </View>
              <Button
                icon="content-copy"
                compact
                accessibilityLabel="Copiar toda a lista de endereços"
                disabled={carregando || copiando || enderecos.length === 0}
                onPress={() =>
                  void copiar(
                    formatarLista(enderecos),
                    "Lista de endereços copiada!",
                  )
                }
              >
                Todos
              </Button>
            </View>
            {/* <AppText variant="bodyMedium" tone="secondary">
              Toque no CEP ou no endereço para copiar. Use o ícone do card para
              copiar os dois.
            </AppText> */}
            {carregando ? (
              <View style={styles.loading}>
                <ActivityIndicator accessibilityLabel="Carregando endereços salvos" />
                <AppText variant="bodyMedium">
                  Carregando seus endereços...
                </AppText>
              </View>
            ) : null}
            {erroHistorico ? (
              <View>
                <HelperText type="error" accessibilityRole="alert">
                  Não foi possível carregar seus endereços salvos.
                </HelperText>
                <Button mode="outlined" icon="refresh" onPress={recarregar}>
                  Tentar novamente
                </Button>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !carregando && !erroHistorico ? (
            <AppCard mode="outlined">
              <Card.Content style={styles.emptyContent}>
                <AppText variant="titleMedium">
                  Nenhum endereço salvo ainda
                </AppText>
                <AppText variant="bodyMedium" tone="secondary">
                  Toque em Buscar CEP para fazer sua primeira consulta.
                </AppText>
              </Card.Content>
            </AppCard>
          ) : undefined
        }
        renderItem={({ item }) => (
          <EnderecoCard
            endereco={item}
            onAbrirMapa={() => void abrirMapa(item)}
            onCopiar={(tipo) => copiarEndereco(item, tipo)}
            desabilitado={copiando}
          />
        )}
      />
      <Portal>
        <Snackbar
          visible={Boolean(erroMapa || mensagem)}
          onDismiss={() => { setErroMapa(""); fecharMensagem(); }}
          duration={3000}
        >
          {erroMapa || mensagem}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  list: sharedStyles.listContent,
  header: sharedStyles.stack,
  content: { paddingVertical: spacing.xxl, gap: spacing.lg },
  heroLogo: { width: sizes.homeAvatar, height: sizes.homeAvatar },
  heroTitle: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  title: { flex: 1 },
  button: { ...sharedStyles.buttonContent, paddingHorizontal: spacing.lg },
  searchButton: { width: "100%" },
  historyHeading: { ...sharedStyles.sectionHeading, flexWrap: "wrap" },
  historyTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyContent: { gap: spacing.sm, paddingVertical: spacing.xxl },
});

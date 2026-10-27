import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  IconButton,
  TouchableRipple,
  Tooltip,
  useTheme,
} from "react-native-paper";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { spacing } from "../theme/tokens";
import type { Endereco } from "../services/enderecos";

import type { TipoCopia } from "../services/formatarEndereco";

type Props = {
  endereco: Endereco;
  children?: ReactNode;
  onExcluir?: () => void;
  onAbrirMapa?: () => void;
  excluindo?: boolean;
  desabilitado?: boolean;
  onCopiar?: (tipo: TipoCopia) => void;
};

export function EnderecoCard({
  endereco,
  children,
  onExcluir,
  onCopiar,
  onAbrirMapa,
  excluindo = false,
  desabilitado = false,
}: Props) {
  const theme = useTheme();
  const cep = (
    <AppText variant="titleLarge" tone="primary" style={styles.cep}>
      {endereco.cep}
    </AppText>
  );
  const enderecoConteudo = (
    <View>
      <AppText variant="titleMedium">
        {endereco.logradouro || "Logradouro não informado"}
      </AppText>
      {endereco.bairro ? (
        <AppText variant="bodyMedium" tone="secondary">
          {endereco.bairro}
        </AppText>
      ) : null}
      <AppText variant="bodyMedium" tone="secondary">
        {endereco.localidade} - {endereco.uf}
      </AppText>
    </View>
  );
  return (
    <AppCard mode="outlined">
      <Card.Content style={styles.content}>
        <View style={styles.heading}>
          {onCopiar ? (
            <TouchableRipple
              style={styles.cepAction}
              accessibilityRole="button"
              accessibilityLabel={`Copiar CEP ${endereco.cep}`}
              disabled={desabilitado}
              onPress={() => onCopiar("cep")}
            >
              {cep}
            </TouchableRipple>
          ) : (
            cep
          )}
          {onCopiar ? (
            <Tooltip title="Copiar endereço e CEP">
              <IconButton
                icon="content-copy"
                mode="contained-tonal"
                iconColor={theme.colors.primary}
                containerColor={theme.colors.primaryContainer}
                accessibilityLabel={`Copiar endereço e CEP ${endereco.cep}`}
                disabled={desabilitado}
                onPress={() => onCopiar("tudo")}
                style={styles.copyButton}
                size={15}
              />
            </Tooltip>
          ) : null}
          {onExcluir ? (
            <Tooltip title="Excluir endereço">
              <IconButton
                icon="close"
                mode="contained"
                size={15}
                iconColor={theme.colors.error}
                containerColor={theme.colors.errorContainer}
                accessibilityLabel={`Excluir CEP ${endereco.cep}`}
                accessibilityHint="Remove este endereço da lista salva."
                accessibilityState={{
                  disabled: desabilitado || excluindo,
                  busy: excluindo,
                }}
                disabled={desabilitado || excluindo}
                loading={excluindo}
                onPress={onExcluir}
                style={[
                  styles.deleteButton,
                  { borderColor: theme.colors.error },
                ]}
              />
            </Tooltip>
          ) : null}
        </View>
        <View style={onAbrirMapa ? styles.addressRow : undefined}>
          <View style={onAbrirMapa ? styles.addressBody : undefined}>
            {onCopiar ? (
              <TouchableRipple
                accessibilityRole="button"
                accessibilityLabel={`Copiar endereço do CEP ${endereco.cep}`}
                accessibilityHint="Copia logradouro, bairro, cidade e estado, sem o CEP."
                disabled={desabilitado}
                onPress={() => onCopiar("endereco")}
              >
                {enderecoConteudo}
              </TouchableRipple>
            ) : (
              enderecoConteudo
            )}
          </View>
          {onAbrirMapa ? (
            <Tooltip title="Abrir no mapa">
              <IconButton
                icon="map-marker-outline"
                mode="contained-tonal"
                iconColor={theme.colors.primary}
                containerColor={theme.colors.primaryContainer}
                accessibilityLabel={`Abrir CEP ${endereco.cep} no mapa`}
                accessibilityHint="Abre este endereço no Google Maps."
                disabled={desabilitado}
                onPress={onAbrirMapa}
                style={styles.mapButton}
                size={20}
              />
            </Tooltip>
          ) : null}
        </View>
      </Card.Content>
      {children ? <Card.Actions>{children}</Card.Actions> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xs, paddingVertical: spacing.xl },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cep: { flex: 1, flexShrink: 1 },
  cepAction: {
    flex: 1,
    minHeight: 30,
    justifyContent: "center",
  },
  addressRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  addressBody: { flex: 1 },
  mapButton: {
    margin: 0,
    width: 30,
    height: 30,
    borderRadius: 8,
    right: -7,
    bottom: -9,
    backgroundColor: "none",
  },
  copyButton: {
    margin: 0,
    borderRadius: 8,
    top: -9,
    right: -7,
    width: 30,
    height: 30,
    backgroundColor: "none",
  },
  deleteButton: {
    margin: 0,
    width: 23,
    height: 23,
    borderRadius: 8,
    top: -9,
    right: -7,
    backgroundImage: "linear-gradient(135deg, #ffdad6 0%, #ff8a80 100%)",
  },
});

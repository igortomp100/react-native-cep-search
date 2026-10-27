import { radii, sizes, spacing, typography } from "../theme/tokens";
import { AppText } from "./AppText";
import { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu } from "react-native-paper";
import { UFS } from "../services/enderecos";
import { NOMES_ESTADOS } from "../constants/estados";

type Props = {
  value: string;
  disabled?: boolean;
  onChange: (uf: string) => void;
};

const estados = UFS.map((sigla) => ({
  sigla,
  nome: NOMES_ESTADOS[sigla],
})).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

export function UfSelect({ value, disabled = false, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const selecionado = estados.find((estado) => estado.sigla === value);

  function abrir() {
    Keyboard.dismiss();
    setVisible(true);
  }

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchorPosition="bottom"
        overlayAccessibilityLabel="Fechar seleção de estado"
        anchor={
          <Button
            mode="outlined"
            icon="chevron-down"
            disabled={disabled}
            accessibilityLabel={
              selecionado
                ? `UF: ${selecionado.sigla}, ${selecionado.nome}. Alterar estado`
                : "Selecionar UF"
            }
            accessibilityState={{ expanded: visible, disabled }}
            onPress={abrir}
            style={styles.anchor}
            contentStyle={styles.anchorContent}
            labelStyle={styles.anchorLabel}
          >
            {selecionado
              ? `${selecionado.sigla} — ${selecionado.nome}`
              : "Selecione o estado"}
          </Button>
        }
      >
        <ScrollView
          style={styles.options}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {estados.map(({ sigla, nome }) => (
            <Menu.Item
              key={sigla}
              title={`${sigla} — ${nome}`}
              accessibilityLabel={`${sigla}, ${nome}`}
              accessibilityState={{ selected: value === sigla }}
              trailingIcon={value === sigla ? "check" : undefined}
              disabled={disabled}
              onPress={() => {
                onChange(sigla);
                setVisible(false);
              }}
              style={styles.option}
            />
          ))}
        </ScrollView>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  anchor: { borderRadius: radii.control },
  anchorContent: {
    minHeight: sizes.inputHeight,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  anchorLabel: { ...typography.inputLabel, textAlign: "left" },
  options: { maxHeight: sizes.menuMaxHeight },
  option: { minWidth: sizes.menuMinWidth },
});

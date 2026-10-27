import { sharedStyles } from '../theme/sharedStyles';
import { spacing } from '../theme/tokens';
import { AppText } from './AppText';
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { consultarEndereco, type Endereco } from "../services/enderecos";
import { KEYBOARD_OFFSETS } from "../constants/keyboardOffsets";
import { Button, HelperText } from 'react-native-paper';
import { KeyboardAwareTextInput } from "./KeyboardAwareTextInput";
import { EnderecoCard } from "./EnderecoCard";
import { UfSelect } from "./UfSelect";
import type { PesquisaEndereco } from '../services/localizacao';

type Props = {
  valoresIniciais?: PesquisaEndereco;
  enderecosSalvos: Endereco[];
  desabilitado: boolean;
  salvando: string | null;
  onSalvar: (endereco: Endereco) => Promise<void>;
  onInputFocus: (
    input: ComponentRef<typeof TextInput> | null,
    offset?: number,
  ) => void;
};

export function BuscaPorEndereco({
  enderecosSalvos,
  desabilitado,
  salvando,
  onSalvar,
  onInputFocus,
  valoresIniciais,
}: Props) {
  const [uf, setUf] = useState(valoresIniciais?.uf ?? "");
  const [cidade, setCidade] = useState(valoresIniciais?.cidade ?? "");
  const [logradouro, setLogradouro] = useState(valoresIniciais?.logradouro ?? "");
  const [resultados, setResultados] = useState<Endereco[] | null>(null);
  const [pesquisando, setPesquisando] = useState(false);
  const [erro, setErro] = useState("");
  const ativo = useRef(true);
  const ocupado = useRef(false);
  const requisicao = useRef<AbortController | null>(null);
  const bloqueado = desabilitado || pesquisando;

  useEffect(() => {
    ativo.current = true;
    return () => {
      ativo.current = false;
      requisicao.current?.abort();
    };
  }, []);

  function editar(setter: (value: string) => void, value: string) {
    setter(value);
    setResultados(null);
    setErro("");
  }

  async function pesquisar() {
    if (ocupado.current || desabilitado) return;
    ocupado.current = true;
    setPesquisando(true);
    setErro("");
    setResultados(null);
    Keyboard.dismiss();
    const controller = new AbortController();
    requisicao.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const dados = await consultarEndereco(
        uf,
        cidade,
        logradouro,
        controller.signal,
      );
      if (ativo.current) setResultados(dados);
    } catch (error) {
      if (ativo.current)
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível pesquisar o endereço.",
        );
    } finally {
      clearTimeout(timeout);
      requisicao.current = null;
      ocupado.current = false;
      if (ativo.current) setPesquisando(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppText variant="titleMedium">Pesquise pelo endereço</AppText>
      <AppText variant="bodyMedium" tone="secondary">
        Informe a UF, a cidade e parte do nome da rua, avenida ou praça.
      </AppText>
      <UfSelect
        value={uf}
        onChange={(value) => editar(setUf, value)}
        disabled={bloqueado}
      />
      <KeyboardAwareTextInput
        label="Cidade"
        accessibilityLabel="Cidade para pesquisa"
        keyboardOffset={KEYBOARD_OFFSETS.cidade}
        onInputFocus={onInputFocus}
        placeholder="São Paulo"
        value={cidade}
        onChangeText={(value) => editar(setCidade, value)}
        autoCapitalize="words"
        disabled={bloqueado}
      />
      <KeyboardAwareTextInput
        label="Logradouro"
        accessibilityLabel="Logradouro para pesquisa"
        keyboardOffset={KEYBOARD_OFFSETS.logradouro}
        onInputFocus={onInputFocus}
        placeholder="Digite parte do endereço"
        value={logradouro}
        onChangeText={(value) => editar(setLogradouro, value)}
        autoCapitalize="words"
        disabled={bloqueado}
        returnKeyType="search"
        onSubmitEditing={() => {
          void pesquisar();
        }}
      />
      <HelperText type="info">
        Cidade e logradouro: mínimo de 3 caracteres.
      </HelperText>
      <Button
        mode="contained"
        icon="magnify"
        loading={pesquisando}
        disabled={bloqueado}
        onPress={() => {
          void pesquisar();
        }}
        contentStyle={styles.button}
      >
        {pesquisando ? "Pesquisando..." : "Pesquisar endereço"}
      </Button>
      {erro ? (
        <HelperText
          type="error"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {erro}
        </HelperText>
      ) : null}
      {resultados !== null ? (
        <View style={styles.container}>
          <AppText variant="titleLarge" style={styles.subtitle}>
            Resultados ({resultados.length})
          </AppText>
          <AppText variant="bodyMedium" tone="secondary">
            {resultados.length === 0
              ? "Nenhum endereço encontrado. Confira a cidade e tente outra parte do logradouro."
              : "Confira o bairro e o CEP antes de salvar o endereço."}
          </AppText>
          {resultados.length >= 50 ? (
            <HelperText type="info">
              Limite de 50 resultados atingido. Informe mais detalhes do
              logradouro para refinar a pesquisa.
            </HelperText>
          ) : null}
          {resultados.map((item, index) => {
            const jaSalvo = enderecosSalvos.some(
              (endereco) => endereco.cep === item.cep,
            );
            return (
              <EnderecoCard key={`${item.cep}-${index}`} endereco={item}>
                <Button
                  mode={jaSalvo ? "text" : "contained"}
                  icon={jaSalvo ? "check" : "content-save-outline"}
                  accessibilityLabel={`Salvar ${item.logradouro}, CEP ${item.cep}`}
                  loading={salvando === item.cep}
                  disabled={bloqueado || jaSalvo}
                  onPress={() => {
                    void onSalvar(item);
                  }}
                >
                  {salvando === item.cep
                    ? "Salvando..."
                    : jaSalvo
                      ? "Salvo na lista"
                      : "Salvar endereço"}
                </Button>
              </EnderecoCard>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
container: sharedStyles.stack,
  button: sharedStyles.buttonContent,
  subtitle: { marginTop: spacing.lg },
});

import { AppCard } from '../components/AppCard';
import { sharedStyles } from '../theme/sharedStyles';
import { spacing } from '../theme/tokens';
import { AppText } from '../components/AppText';
import { useRef, useState, type ComponentRef } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnderecos } from '../hooks/useEnderecos';
import { BuscaPorEndereco } from '../components/BuscaPorEndereco';
import { BuscaPorLocalizacao } from '../components/BuscaPorLocalizacao';
import { ModosDeBusca } from '../components/ModosDeBusca';
import type { PesquisaEndereco } from '../services/localizacao';
import { EnderecoCard } from '../components/EnderecoCard';
import { KeyboardAwareTextInput } from '../components/KeyboardAwareTextInput';
import { useKeyboardAwareList } from '../hooks/useKeyboardAwareList';
import type { Endereco } from '../services/enderecos';
import { KEYBOARD_OFFSETS } from '../constants/keyboardOffsets';

export default function BuscarCep() {
  const [cep, setCep] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const keyboardArea = useRef<ComponentRef<typeof View>>(null);
  const { listRef, onInputFocus, revealFocusedInput } = useKeyboardAwareList<Endereco>();
  const [modo, setModo] = useState('cep');
  const [pesquisaInicial, setPesquisaInicial] = useState<PesquisaEndereco>();
  const { enderecos, carregando, consultando, excluindo, salvando, erro, erroHistorico, buscar, excluir, adicionar, recarregar } = useEnderecos();
  const desabilitado = carregando || consultando || excluindo !== null || salvando !== null || erroHistorico;

  function measureKeyboardArea() {
    if (Platform.OS === 'web') return;
    keyboardArea.current?.measureInWindow((_x, y) => setKeyboardOffset(y));
  }

  function consultar() {
    Keyboard.dismiss();
    void buscar(cep);
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <View ref={keyboardArea} style={styles.flex} onLayout={measureKeyboardArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled={Platform.OS !== 'web'} keyboardVerticalOffset={keyboardOffset}>
          <FlatList
            ref={listRef}
            onLayout={revealFocusedInput}
            onContentSizeChange={revealFocusedInput}
            data={enderecos}
            keyExtractor={(item) => item.cep}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <View style={styles.header}>
                <View style={styles.introduction}>
                  <AppText variant="headlineSmall">Encontre um endereço</AppText>
                  <AppText variant="bodyMedium" tone="secondary">Busque por CEP, endereço ou pela localização do celular.</AppText>
                </View>
                <ModosDeBusca value={modo} disabled={desabilitado} onChange={setModo} />
                <AppCard mode="contained">
                  <Card.Content style={styles.form}>
                    {modo === 'cep' ? (
                      <>
                        <AppText variant="titleMedium">Qual CEP você procura?</AppText>
                        <KeyboardAwareTextInput
                          label="CEP"
                          accessibilityLabel="CEP para consulta"
                          keyboardOffset={KEYBOARD_OFFSETS.cep}
                          onInputFocus={onInputFocus}
                          placeholder="01001-000"
                          keyboardType="number-pad"
                          maxLength={9}
                          value={cep}
                          onChangeText={(value) => {
                            const digits = value.replace(/\D/g, '').slice(0, 8);
                            setCep(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
                          }}
                          onSubmitEditing={consultar}
                          returnKeyType="search"
                          disabled={desabilitado}
                        />
                        <Button mode="contained" icon="magnify" loading={consultando} disabled={desabilitado} onPress={consultar} contentStyle={styles.button}>
                          {consultando ? 'Consultando...' : 'Consultar CEP'}
                        </Button>
                      </>
                    ) : modo === 'endereco' ? (
                      <BuscaPorEndereco enderecosSalvos={enderecos} desabilitado={desabilitado} salvando={salvando} onSalvar={adicionar} onInputFocus={onInputFocus} valoresIniciais={pesquisaInicial} />
                    ) : (
                      <BuscaPorLocalizacao enderecosSalvos={enderecos} desabilitado={desabilitado} salvando={salvando} onSalvar={adicionar} onBuscarPorEndereco={(pesquisa) => { setPesquisaInicial(pesquisa); setModo('endereco'); }} />
                    )}
                  </Card.Content>
                </AppCard>
                {erro ? <HelperText type="error" accessibilityRole="alert" accessibilityLiveRegion="polite">{erro}</HelperText> : null}
                {erroHistorico ? <Button mode="outlined" icon="refresh" onPress={recarregar}>Carregar histórico novamente</Button> : null}
                {carregando ? <ActivityIndicator accessibilityLabel="Carregando histórico" /> : null}
                <View style={styles.historyHeading}>
                  <AppText variant="titleLarge">Endereços salvos</AppText>
                  <Chip compact accessibilityLabel={`${enderecos.length} endereços salvos`}>{enderecos.length}</Chip>
                </View>
                <AppText variant="bodyMedium" tone="secondary">Seus endereços ficam disponíveis neste dispositivo.</AppText>
              </View>
            }
            ListEmptyComponent={!carregando && !erroHistorico ? (
              <AppCard mode="outlined" style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <AppText variant="titleMedium">Sua lista começa aqui</AppText>
                  <AppText variant="bodyMedium" tone="secondary">Faça uma consulta para salvar seu primeiro endereço.</AppText>
                </Card.Content>
              </AppCard>
            ) : undefined}
            renderItem={({ item }) => (
              <EnderecoCard
                endereco={item}
                onExcluir={() => { void excluir(item.cep); }}
                excluindo={excluindo === item.cep}
                desabilitado={desabilitado}
              />
            )}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
flex: sharedStyles.screen,
  content: sharedStyles.listContent,
  header: sharedStyles.stack,
  introduction: { gap: spacing.sm, marginVertical: spacing.sm },
  form: { gap: spacing.lg, paddingVertical: spacing.xxl },
  button: sharedStyles.buttonContent,
  historyHeading: sharedStyles.sectionHeading,
  emptyCard: { borderStyle: 'dashed' },
  emptyContent: { gap: spacing.sm, paddingVertical: spacing.xxl },
});

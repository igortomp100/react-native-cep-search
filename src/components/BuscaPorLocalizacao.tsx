import { sharedStyles } from '../theme/sharedStyles';
import { sizes } from '../theme/tokens';
import { AppText } from './AppText';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Avatar, Button, HelperText, useTheme } from 'react-native-paper';
import { buscarPorLocalizacao, ErroLocalizacao, type PesquisaEndereco, type ResultadoLocalizacao } from '../services/localizacao';
import type { Endereco } from '../services/enderecos';
import { EnderecoCard } from './EnderecoCard';

type Props = {
  enderecosSalvos: Endereco[];
  desabilitado: boolean;
  salvando: string | null;
  onSalvar: (endereco: Endereco) => Promise<void>;
  onBuscarPorEndereco: (pesquisa: PesquisaEndereco) => void;
};

export function BuscaPorLocalizacao({ enderecosSalvos, desabilitado, salvando, onSalvar, onBuscarPorEndereco }: Props) {
  const theme = useTheme();
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoLocalizacao | null>(null);
  const [erro, setErro] = useState('');
  const [configuracoes, setConfiguracoes] = useState(false);
  const ativo = useRef(true);
  const ocupado = useRef(false);
  const requisicao = useRef<AbortController | null>(null);
  const web = Platform.OS === 'web';
  const endereco = resultado?.endereco;
  const jaSalvo = endereco ? enderecosSalvos.some((item) => item.cep === endereco.cep) : false;

  useEffect(() => {
    ativo.current = true;
    return () => { ativo.current = false; requisicao.current?.abort(); };
  }, []);

  async function localizar() {
    if (ocupado.current || desabilitado || web) return;
    ocupado.current = true;
    setBuscando(true);
    setErro('');
    setResultado(null);
    setConfiguracoes(false);
    const controller = new AbortController();
    requisicao.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const dados = await buscarPorLocalizacao(controller.signal);
      if (ativo.current) setResultado(dados);
    } catch (error) {
      if (ativo.current) {
        setErro(error instanceof Error ? error.message : 'Não foi possível consultar sua localização. Tente novamente.');
        setConfiguracoes(error instanceof ErroLocalizacao && error.abrirConfiguracoes);
      }
    } finally {
      clearTimeout(timeout);
      requisicao.current = null;
      ocupado.current = false;
      if (ativo.current) setBuscando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Avatar.Icon size={sizes.locationAvatar} icon="crosshairs-gps" color={theme.colors.onPrimaryContainer} style={{ backgroundColor: theme.colors.primaryContainer }} />
      <AppText variant="titleMedium">Encontre o CEP de onde você está</AppText>
      <AppText variant="bodyMedium" tone="secondary">Use a localização do celular para sugerir um endereço. Confira o resultado antes de salvar.</AppText>
      <Button mode="contained" icon="crosshairs-gps" loading={buscando} disabled={web || desabilitado || buscando} onPress={() => { void localizar(); }} contentStyle={styles.button}>{buscando ? 'Buscando sua localização...' : 'Usar minha localização'}</Button>
      <HelperText type="info">{web ? 'Para usar a localização, abra este projeto no Expo Go no Android ou iPhone. A conversão da posição em endereço não está disponível nesta versão web.' : 'A permissão é solicitada ao tocar no botão. A localização é consultada uma vez, sem acompanhamento em segundo plano.'}</HelperText>
      {erro ? <HelperText type="error" accessibilityRole="alert" accessibilityLiveRegion="polite">{erro}</HelperText> : null}
      {configuracoes ? <Button mode="outlined" icon="cog-outline" onPress={() => { void Linking.openSettings().catch(() => setErro('Abra as configurações do celular e habilite a localização para este aplicativo.')); }}>Abrir configurações</Button> : null}
      {resultado ? (
        <View style={styles.container}>
          <AppText variant="bodyMedium" tone="secondary">{resultado.aviso}</AppText>
          {endereco ? (
            <EnderecoCard endereco={endereco}>
              <Button mode={jaSalvo ? 'text' : 'contained'} icon={jaSalvo ? 'check' : 'content-save-outline'} loading={salvando === endereco.cep} disabled={desabilitado || jaSalvo} onPress={() => { void onSalvar(endereco); }}>{salvando === endereco.cep ? 'Salvando...' : jaSalvo ? 'Salvo na lista' : 'Salvar endereço'}</Button>
            </EnderecoCard>
          ) : (
            <>
              <AppText variant="bodyMedium">{[resultado.pesquisa.logradouro, resultado.pesquisa.cidade, resultado.pesquisa.uf].filter(Boolean).join(' — ') || 'Endereço incompleto. Você pode preencher os dados manualmente.'}</AppText>
              <Button mode="outlined" icon="map-search-outline" disabled={desabilitado} onPress={() => onBuscarPorEndereco(resultado.pesquisa)}>Continuar por endereço</Button>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
container: sharedStyles.stack,
  button: sharedStyles.buttonContent,
});

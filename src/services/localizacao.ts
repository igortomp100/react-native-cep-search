import * as Location from 'expo-location';
import { consultarCep, type Endereco, UFS } from './enderecos';
import { NOMES_ESTADOS } from '../constants/estados';

export type PesquisaEndereco = { uf: string; cidade: string; logradouro: string };
export type ResultadoLocalizacao = {
  endereco: Endereco | null;
  pesquisa: PesquisaEndereco;
  aviso: string;
};

export class ErroLocalizacao extends Error {
  constructor(message: string, public abrirConfiguracoes = false) {
    super(message);
    this.name = 'ErroLocalizacao';
  }
}

function normalizar(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
}

function resolverUf(region: string | null) {
  const estado = normalizar(region ?? '');
  return UFS.find((uf) => uf === estado || normalizar(NOMES_ESTADOS[uf]) === estado) ?? '';
}

// Interrompe o fluxo ao sair da tela, mesmo quando a operação nativa não é cancelável.
function aguardar<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new ErroLocalizacao('A busca demorou demais. Tente novamente.'));
  return new Promise((resolve, reject) => {
    const cancelar = () => reject(new ErroLocalizacao('A busca demorou demais. Tente novamente.'));
    signal.addEventListener('abort', cancelar, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', cancelar));
  });
}

export async function buscarPorLocalizacao(signal: AbortSignal): Promise<ResultadoLocalizacao> {
  if (signal.aborted) throw new ErroLocalizacao('A busca foi cancelada. Tente novamente.');
  const permissao = await aguardar(Location.requestForegroundPermissionsAsync(), signal);
  if (!permissao.granted) {
    throw new ErroLocalizacao(
      permissao.canAskAgain
        ? 'Precisamos da permissão de localização para encontrar seu endereço. Você também pode usar os outros modos de busca.'
        : 'O acesso à localização está bloqueado. Você pode habilitá-lo nas configurações do aplicativo.',
      !permissao.canAskAgain,
    );
  }
  if (!await aguardar(Location.hasServicesEnabledAsync(), signal)) {
    throw new ErroLocalizacao('Ative a localização do celular e tente novamente.');
  }
  let posicao: Location.LocationObject;
  try {
    posicao = await aguardar(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), signal);
  } catch (error) {
    if (error instanceof ErroLocalizacao) throw error;
    throw new ErroLocalizacao('Não foi possível obter sua posição. Verifique a localização do celular e tente novamente.');
  }
  let locais: Location.LocationGeocodedAddress[];
  try {
    locais = await aguardar(Location.reverseGeocodeAsync({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }), signal);
  } catch (error) {
    if (error instanceof ErroLocalizacao) throw error;
    throw new ErroLocalizacao('Não foi possível converter sua localização em endereço. Tente novamente ou use a busca por endereço.');
  }
  const local = locais.find((item) => !item.isoCountryCode || item.isoCountryCode.toUpperCase() === 'BR');
  if (!local) throw new ErroLocalizacao(locais.length ? 'A busca de CEP está disponível para endereços no Brasil.' : 'Nenhum endereço foi encontrado para esta posição. Tente novamente ou use a busca por endereço.');
  const pesquisa = {
    uf: resolverUf(local.region),
    cidade: local.city || local.subregion || '',
    logradouro: local.street || '',
  };
  const cep = (local.postalCode ?? '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) {
    return { endereco: null, pesquisa, aviso: 'A localização não retornou um CEP completo. Confira os dados encontrados e continue na busca por endereço.' };
  }
  try {
    const endereco = await consultarCep(cep, signal);
    if (signal.aborted) throw new ErroLocalizacao('A busca demorou demais. Tente novamente.');
    return { endereco, pesquisa, aviso: 'Endereço sugerido pela localização. Confira o logradouro, o bairro e o CEP antes de salvar.' };
  } catch (error) {
    if (signal.aborted || error instanceof ErroLocalizacao) throw new ErroLocalizacao('A busca demorou demais. Tente novamente.');
    return { endereco: null, pesquisa, aviso: 'Não foi possível confirmar o CEP no ViaCEP. Tente novamente ou continue na busca por endereço.' };
  }
}

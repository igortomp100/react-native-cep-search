import AsyncStorage from '@react-native-async-storage/async-storage';

export type Endereco = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

const STORAGE_KEY = '@cep-app/enderecos:v1';

function isEndereco(value: unknown): value is Endereco {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['cep', 'logradouro', 'bairro', 'localidade', 'uf'].every(
    (field) => typeof item[field] === 'string',
  ) && /^\d{5}-?\d{3}$/.test(item.cep as string);
}

export async function carregarEnderecos(): Promise<Endereco[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isEndereco)) {
    throw new Error('Histórico salvo em formato inválido.');
  }
  return data;
}

export async function salvarEnderecos(enderecos: Endereco[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(enderecos));
}

export async function consultarCep(cep: string, signal?: AbortSignal): Promise<Endereco> {
  const digits = cep.replace(/\D/g, '');
  if (!/^\d{8}$/.test(digits)) {
    throw new Error('Digite um CEP com 8 números.');
  }
  let response: Response;
  try {
    response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal });
  } catch {
    throw new Error(signal?.aborted
      ? 'A consulta demorou demais. Tente novamente.'
      : 'Não foi possível consultar o ViaCEP. Verifique sua conexão.');
  }
  if (!response.ok) throw new Error('O ViaCEP está indisponível. Tente novamente.');
  const data: unknown = await response.json();
  if (data && typeof data === 'object' && 'erro' in data && data.erro) {
    throw new Error('CEP não encontrado.');
  }
  if (!isEndereco(data)) throw new Error('O ViaCEP retornou um endereço inválido.');
  return {
    cep: data.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    localidade: data.localidade,
    uf: data.uf,
  };
}

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] as const;

export async function consultarEndereco(
  uf: string, cidade: string, logradouro: string, signal?: AbortSignal,
): Promise<Endereco[]> {
  const estado = uf.trim().toUpperCase();
  const municipio = cidade.trim();
  const rua = logradouro.trim();
  if (!UFS.some((item) => item === estado)) throw new Error('Informe uma UF válida, como SP.');
  if (municipio.length < 3) throw new Error('Informe a cidade com pelo menos 3 caracteres.');
  if (rua.length < 3) throw new Error('Informe pelo menos 3 caracteres do logradouro.');
  const caminho = [estado, municipio, rua].map(encodeURIComponent).join('/');
  let response: Response;
  let data: unknown;
  try {
    response = await fetch(`https://viacep.com.br/ws/${caminho}/json/`, { signal });
    if (response.ok) data = await response.json();
  } catch {
    throw new Error(signal?.aborted
      ? 'A pesquisa demorou demais. Tente novamente.'
      : 'Não foi possível pesquisar no ViaCEP. Verifique sua conexão.');
  }
  if (!response.ok) throw new Error('O ViaCEP está indisponível. Tente novamente.');
  if (!Array.isArray(data) || !data.every(isEndereco)) {
    throw new Error('O ViaCEP retornou uma lista de endereços inválida.');
  }
  // Guarda somente os campos utilizados pelo aplicativo.
  return data.map(({ cep, logradouro, bairro, localidade, uf }) => ({ cep, logradouro, bairro, localidade, uf }));
}

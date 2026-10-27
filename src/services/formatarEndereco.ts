import type { Endereco } from './enderecos';

export type TipoCopia = 'cep' | 'endereco' | 'tudo';

export function formatarEndereco(endereco: Endereco): string {
  const cidade = [endereco.localidade.trim(), endereco.uf.trim()].filter(Boolean).join('/');
  return [endereco.logradouro.trim(), endereco.bairro.trim(), cidade].filter(Boolean).join('\n');
}

export function formatarCopia(endereco: Endereco, tipo: TipoCopia): string {
  if (tipo === 'cep') return endereco.cep;
  const texto = formatarEndereco(endereco);
  if (tipo === 'endereco') return texto;
  return [texto, 'CEP: ' + endereco.cep].filter(Boolean).join('\n');
}

export function formatarLista(enderecos: readonly Endereco[]): string {
  return enderecos.map(endereco => formatarCopia(endereco, 'tudo')).join('\n\n');
}

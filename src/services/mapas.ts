import { Linking } from 'react-native';
import type { Endereco } from './enderecos';

export function criarUrlMapa(endereco: Endereco): string {
  const consulta = [
    endereco.logradouro,
    endereco.bairro,
    endereco.localidade,
    endereco.uf,
    endereco.cep,
    'Brasil',
  ].map(parte => parte.trim()).filter(Boolean).join(', ');

  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(consulta);
}

export async function abrirEnderecoNoMapa(endereco: Endereco): Promise<void> {
  await Linking.openURL(criarUrlMapa(endereco));
}

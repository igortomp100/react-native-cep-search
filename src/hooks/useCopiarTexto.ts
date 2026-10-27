import { useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';

export function useCopiarTexto() {
  const ocupado = useRef(false);
  const [copiando, setCopiando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function copiar(texto: string, confirmacao: string) {
    if (ocupado.current || !texto.trim()) return;
    ocupado.current = true;
    setCopiando(true);
    setMensagem('');
    try {
      const copiado = await Clipboard.setStringAsync(texto);
      if (!copiado) throw new Error('Cópia indisponível');
      setMensagem(confirmacao);
    } catch {
      setMensagem('Não foi possível copiar. Tente novamente.');
    } finally {
      ocupado.current = false;
      setCopiando(false);
    }
  }

  return { copiar, copiando, mensagem, fecharMensagem: () => setMensagem('') };
}

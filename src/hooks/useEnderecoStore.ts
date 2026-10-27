import { useEffect, useRef, useState } from 'react';
import { carregarEnderecos, consultarCep, salvarEnderecos, type Endereco } from '../services/enderecos';

export function useEnderecoStore() {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [consultando, setConsultando] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [erroHistorico, setErroHistorico] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const ativo = useRef(true);
  const ocupado = useRef(false);
  const requisicao = useRef<AbortController | null>(null);

  useEffect(() => {
    ativo.current = true;
    return () => {
      ativo.current = false;
      requisicao.current?.abort();
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    carregarEnderecos()
      .then((dados) => { if (!cancelado) setEnderecos(dados); })
      .catch(() => {
        if (!cancelado) {
          setErroHistorico(true);
          setErro('Não foi possível abrir o histórico salvo. Tente carregar novamente.');
        }
      })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [tentativa]);

  async function buscar(cep: string) {
    if (ocupado.current || carregando || erroHistorico) return;
    ocupado.current = true;
    setConsultando(true);
    setErro('');
    const controller = new AbortController();
    requisicao.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const endereco = await consultarCep(cep, controller.signal);
      if (!ativo.current) return;
      await persistirEndereco(endereco);
    } catch (error) {
      if (ativo.current) setErro(error instanceof Error ? error.message : 'Não foi possível concluir a consulta.');
    } finally {
      clearTimeout(timeout);
      requisicao.current = null;
      ocupado.current = false;
      if (ativo.current) setConsultando(false);
    }
  }

  async function persistirEndereco(endereco: Endereco) {
    const proximaLista = [endereco, ...enderecos.filter((item) => item.cep !== endereco.cep)];
    try {
      await salvarEnderecos(proximaLista);
    } catch {
      throw new Error('Não foi possível salvar o endereço. Tente novamente.');
    }
    if (ativo.current) setEnderecos(proximaLista);
  }

  async function adicionar(endereco: Endereco) {
    if (ocupado.current || carregando || erroHistorico) return;
    ocupado.current = true;
    setSalvando(endereco.cep);
    setErro('');
    try {
      await persistirEndereco(endereco);
    } catch (error) {
      if (ativo.current) setErro(error instanceof Error ? error.message : 'Não foi possível salvar o endereço.');
    } finally {
      ocupado.current = false;
      if (ativo.current) setSalvando(null);
    }
  }

  async function excluir(cep: string) {
    if (ocupado.current || carregando || erroHistorico) return;
    ocupado.current = true;
    setExcluindo(cep);
    setErro('');
    try {
      const proximaLista = enderecos.filter((item) => item.cep !== cep);
      await salvarEnderecos(proximaLista);
      if (ativo.current) setEnderecos(proximaLista);
    } catch {
      if (ativo.current) setErro('Não foi possível excluir o CEP. O endereço foi mantido na lista. Tente novamente.');
    } finally {
      ocupado.current = false;
      if (ativo.current) setExcluindo(null);
    }
  }

  return {
    enderecos, carregando, consultando, excluindo, salvando, erro, erroHistorico, buscar, excluir, adicionar,
    recarregar: () => {
      setCarregando(true);
      setErroHistorico(false);
      setErro('');
      setTentativa((valor) => valor + 1);
    },
  };
}

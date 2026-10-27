import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEnderecoStore } from '../../src/hooks/useEnderecoStore';
import { carregarEnderecos, salvarEnderecos } from '../../src/services/enderecos';
import { paulista, pendente, resposta, se } from '../support/enderecos';

let fetchMock: jest.SpiedFunction<typeof fetch>;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Sem conexão'));
});

afterEach(() => { jest.useRealTimers(); });

async function abrirHistorico() {
  const hook = await renderHook(() => useEnderecoStore());
  await waitFor(() => expect(hook.result.current.carregando).toBe(false));
  return hook;
}

describe('histórico de endereços: hook + serviço + armazenamento simulado', () => {
  test('recupera os endereços de uma sessão anterior', async () => {
    await salvarEnderecos([paulista, se]);
    const { result } = await abrirHistorico();
    expect(result.current.enderecos).toEqual([paulista, se]);
    expect(result.current.erroHistorico).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('consulta, salva e recupera o CEP ao abrir uma nova sessão', async () => {
    fetchMock.mockResolvedValueOnce(resposta(se));
    const primeiraSessao = await abrirHistorico();
    await act(() => primeiraSessao.result.current.buscar('01001-000'));
    expect(primeiraSessao.result.current.enderecos).toEqual([se]);
    expect(primeiraSessao.result.current.erro).toBe('');
    await primeiraSessao.unmount();

    const segundaSessao = await abrirHistorico();
    expect(segundaSessao.result.current.enderecos).toEqual([se]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('salva um endereço selecionado sem fazer outra consulta', async () => {
    const { result } = await abrirHistorico();
    await act(() => result.current.adicionar(se));
    expect(result.current.enderecos).toEqual([se]);
    await expect(carregarEnderecos()).resolves.toEqual([se]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('atualiza um CEP existente, sem duplicá-lo, e o move para o início', async () => {
    await salvarEnderecos([paulista, se]);
    const atualizado = { ...se, bairro: 'Centro' };
    fetchMock.mockResolvedValueOnce(resposta(atualizado));
    const { result } = await abrirHistorico();
    await act(() => result.current.buscar(se.cep));
    expect(result.current.enderecos).toEqual([atualizado, paulista]);
    await expect(carregarEnderecos()).resolves.toEqual([atualizado, paulista]);
  });

  test('não altera a lista enquanto a gravação ainda não foi confirmada', async () => {
    const { result } = await abrirHistorico();
    const gravacao = pendente<void>();
    jest.mocked(AsyncStorage.setItem).mockImplementationOnce(() => gravacao.promise);
    let operacao!: Promise<void>;
    await act(() => { operacao = result.current.adicionar(se); });
    expect(result.current.salvando).toBe(se.cep);
    expect(result.current.enderecos).toEqual([]);
    await act(async () => { gravacao.resolve(); await operacao; });
    expect(result.current.enderecos).toEqual([se]);
    expect(result.current.salvando).toBeNull();
  });

  test('mantém os registros antigos se salvar um novo endereço falhar', async () => {
    await salvarEnderecos([se]);
    const { result } = await abrirHistorico();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Sem espaço'));
    await act(() => result.current.adicionar(paulista));
    expect(result.current.enderecos).toEqual([se]);
    expect(result.current.erro).toContain('Não foi possível salvar');
    expect(result.current.salvando).toBeNull();
    await expect(carregarEnderecos()).resolves.toEqual([se]);
  });

  test('não apresenta como salvo um resultado cuja persistência falhou', async () => {
    fetchMock.mockResolvedValueOnce(resposta(se));
    const { result } = await abrirHistorico();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Sem espaço'));
    await act(() => result.current.buscar(se.cep));
    expect(result.current.enderecos).toEqual([]);
    expect(result.current.erro).toContain('Não foi possível salvar');
    expect(result.current.consultando).toBe(false);
  });

  test('exclui somente o CEP escolhido e persiste a exclusão', async () => {
    await salvarEnderecos([paulista, se]);
    const { result } = await abrirHistorico();
    await act(() => result.current.excluir(se.cep));
    expect(result.current.enderecos).toEqual([paulista]);
    expect(result.current.excluindo).toBeNull();
    await expect(carregarEnderecos()).resolves.toEqual([paulista]);
  });

  test('mantém o endereço visível e salvo se a exclusão falhar', async () => {
    await salvarEnderecos([se]);
    const { result } = await abrirHistorico();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Gravação indisponível'));
    await act(() => result.current.excluir(se.cep));
    expect(result.current.enderecos).toEqual([se]);
    expect(result.current.erro).toContain('endereço foi mantido');
    expect(result.current.excluindo).toBeNull();
    await expect(carregarEnderecos()).resolves.toEqual([se]);
  });

  test('não faz requisição nem altera o histórico ao receber CEP inválido', async () => {
    await salvarEnderecos([se]);
    const { result } = await abrirHistorico();
    await act(() => result.current.buscar('123'));
    expect(result.current.erro).toContain('8 números');
    expect(result.current.enderecos).toEqual([se]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('preserva o histórico e libera a consulta para uma nova tentativa após falha de rede', async () => {
    await salvarEnderecos([se]);
    const { result } = await abrirHistorico();
    await act(() => result.current.buscar(paulista.cep));
    expect(result.current.erro).toContain('Verifique sua conexão');
    expect(result.current.enderecos).toEqual([se]);
    expect(result.current.consultando).toBe(false);

    fetchMock.mockResolvedValueOnce(resposta(paulista));
    await act(() => result.current.buscar(paulista.cep));
    expect(result.current.erro).toBe('');
    expect(result.current.enderecos).toEqual([paulista, se]);
  });

  test('bloqueia gravações enquanto o histórico inicial ainda está carregando', async () => {
    const leitura = pendente<string | null>();
    jest.mocked(AsyncStorage.getItem).mockImplementationOnce(() => leitura.promise);
    const { result } = await renderHook(() => useEnderecoStore());
    expect(result.current.carregando).toBe(true);
    await act(async () => {
      await result.current.buscar(se.cep);
      await result.current.adicionar(se);
      await result.current.excluir(se.cep);
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    await act(() => { leitura.resolve(JSON.stringify([se])); });
    expect(result.current.enderecos).toEqual([se]);
  });

  test('protege um histórico ilegível e permite recuperá-lo por nova tentativa', async () => {
    await salvarEnderecos([se]);
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('Falha de leitura'));
    const { result } = await abrirHistorico();
    expect(result.current.erroHistorico).toBe(true);
    jest.mocked(AsyncStorage.setItem).mockClear();
    await act(async () => {
      await result.current.buscar(paulista.cep);
      await result.current.adicionar(paulista);
      await result.current.excluir(se.cep);
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    await act(() => result.current.recarregar());
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erroHistorico).toBe(false);
    expect(result.current.erro).toBe('');
    expect(result.current.enderecos).toEqual([se]);
  });

  test('impede consultas e alterações concorrentes para não perder endereços', async () => {
    await salvarEnderecos([se]);
    const consulta = pendente<Response>();
    fetchMock.mockReturnValueOnce(consulta.promise);
    const { result } = await abrirHistorico();
    let operacao!: Promise<void>;
    await act(() => { operacao = result.current.buscar(paulista.cep); });
    expect(result.current.consultando).toBe(true);
    await act(async () => {
      await result.current.buscar(se.cep);
      await result.current.excluir(se.cep);
      await result.current.adicionar(se);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.enderecos).toEqual([se]);
    await act(async () => { consulta.resolve(resposta(paulista)); await operacao; });
    expect(result.current.enderecos).toEqual([paulista, se]);
    await expect(carregarEnderecos()).resolves.toEqual([paulista, se]);
  });

  test('cancela a consulta após 15 segundos e permite tentar de novo', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('AbortError')), { once: true });
    }));
    const { result } = await abrirHistorico();
    await act(async () => {
      const operacao = result.current.buscar(se.cep);
      await jest.advanceTimersByTimeAsync(15000);
      await operacao;
    });
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(result.current.erro).toContain('demorou demais');
    expect(result.current.consultando).toBe(false);
    fetchMock.mockResolvedValueOnce(resposta(se));
    await act(() => result.current.buscar(se.cep));
    expect(result.current.enderecos).toEqual([se]);
  });

  test('cancela a requisição ao desmontar, sem salvar seu resultado tardio', async () => {
    fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('AbortError')), { once: true });
    }));
    const hook = await abrirHistorico();
    let operacao!: Promise<void>;
    await act(() => { operacao = hook.result.current.buscar(se.cep); });
    await hook.unmount();
    await operacao;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

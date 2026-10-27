import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  carregarEnderecos, consultarCep, consultarEndereco, salvarEnderecos,
} from '../../src/services/enderecos';
import { paulista, resposta, se } from '../support/enderecos';

let fetchMock: jest.SpiedFunction<typeof fetch>;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Requisição não prevista pelo teste'));
});

describe('persistência dos endereços', () => {
  test('começa com lista vazia quando ainda não há histórico', async () => {
    await expect(carregarEnderecos()).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('recupera exatamente os endereços e a ordem salvos', async () => {
    await salvarEnderecos([paulista, se]);
    await expect(carregarEnderecos()).resolves.toEqual([paulista, se]);
    await salvarEnderecos([]);
    await expect(carregarEnderecos()).resolves.toEqual([]);
  });

  test('informa falha de leitura em vez de tratar o histórico como vazio', async () => {
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('Leitura indisponível'));
    await expect(carregarEnderecos()).rejects.toThrow('Leitura indisponível');
  });

  test('propaga falha de gravação para que o estado não simule um salvamento', async () => {
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Sem espaço'));
    await expect(salvarEnderecos([se])).rejects.toThrow('Sem espaço');
  });

  test.each(['{', '{}', 'null', '[{"cep":"01001-000"}]', '[{"cep":123}]'])(
    'rejeita histórico corrompido ou incompatível: %s', async (raw) => {
      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(raw);
      await expect(carregarEnderecos()).rejects.toThrow();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    },
  );
});

describe('consulta por CEP', () => {
  test.each(['01001000', '01001-000'])(
    'consulta CEP %s e mantém somente os campos usados no app', async (cep) => {
      fetchMock.mockResolvedValueOnce(resposta({ ...se, ibge: '3550308', ddd: '11' }));
      await expect(consultarCep(cep)).resolves.toEqual(se);
      expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/', { signal: undefined });
    },
  );

  test.each(['', '1234567', '123456789', 'abcdefgh'])(
    'rejeita CEP inválido antes de acessar a rede: %s', async (cep) => {
      await expect(consultarCep(cep)).rejects.toThrow('Digite um CEP com 8 números.');
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  test('distingue CEP inexistente de falha de conexão', async () => {
    fetchMock.mockResolvedValueOnce(resposta({ erro: true }));
    await expect(consultarCep('00000000')).rejects.toThrow('CEP não encontrado.');
  });

  test('trata resposta HTTP sem sucesso', async () => {
    fetchMock.mockResolvedValueOnce(resposta(null, false));
    await expect(consultarCep(se.cep)).rejects.toThrow('O ViaCEP está indisponível.');
  });

  test('trata indisponibilidade da rede', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(consultarCep(se.cep)).rejects.toThrow('Verifique sua conexão.');
  });

  test('encaminha o sinal de cancelamento e informa tempo esgotado', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockRejectedValueOnce(new Error('AbortError'));
    await expect(consultarCep(se.cep, controller.signal)).rejects.toThrow('A consulta demorou demais.');
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });

  test.each([null, [], { ...se, uf: null }, { ...se, cep: '123' }])(
    'rejeita endereço inesperado vindo da API: %j', async (data) => {
      fetchMock.mockResolvedValueOnce(resposta(data));
      await expect(consultarCep(se.cep)).rejects.toThrow('O ViaCEP retornou um endereço inválido.');
    },
  );
});

describe('consulta por endereço', () => {
  test('normaliza UF e espaços e codifica acentos e caracteres reservados da URL', async () => {
    fetchMock.mockResolvedValueOnce(resposta([{ ...se, ibge: '3550308' }, paulista]));
    await expect(consultarEndereco(' sp ', ' São Paulo ', ' Praça & Sé ')).resolves.toEqual([se, paulista]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/SP/S%C3%A3o%20Paulo/Pra%C3%A7a%20%26%20S%C3%A9/json/',
      { signal: undefined },
    );
  });

  test.each([
    ['XX', 'São Paulo', 'Frutuoso', 'UF válida'],
    ['SP', 'ab', 'Frutuoso', 'cidade com pelo menos 3'],
    ['SP', 'São Paulo', 'ab', '3 caracteres do logradouro'],
  ])('valida %s / %s / %s antes da chamada', async (uf, cidade, rua, erro) => {
    await expect(consultarEndereco(uf, cidade, rua)).rejects.toThrow(erro);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('aceita nenhum resultado como uma pesquisa válida', async () => {
    fetchMock.mockResolvedValueOnce(resposta([]));
    await expect(consultarEndereco('SP', 'São Paulo', 'Frutuoso')).resolves.toEqual([]);
  });

  test.each([null, { erro: true }, [se, { cep: '123' }]])(
    'rejeita uma lista inesperada sem aceitar parcialmente dados inválidos: %j', async (data) => {
      fetchMock.mockResolvedValueOnce(resposta(data));
      await expect(consultarEndereco('SP', 'São Paulo', 'Frutuoso')).rejects.toThrow('lista de endereços inválida');
    },
  );

  test('trata falha HTTP', async () => {
    fetchMock.mockResolvedValueOnce(resposta(null, false));
    await expect(consultarEndereco('SP', 'São Paulo', 'Frutuoso')).rejects.toThrow('ViaCEP está indisponível');
  });

  test('trata falha de conexão', async () => {
    await expect(consultarEndereco('SP', 'São Paulo', 'Frutuoso')).rejects.toThrow('Verifique sua conexão.');
  });

  test('distingue cancelamento de falha de rede e encaminha o sinal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(consultarEndereco('SP', 'São Paulo', 'Frutuoso', controller.signal)).rejects.toThrow('A pesquisa demorou demais.');
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});

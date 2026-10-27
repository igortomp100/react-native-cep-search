# Testes de consulta e persistência

## Executar

```bash
npm ci
npm test
npm run test:watch
npm run test:coverage
```

Não é necessário iniciar o Expo, conectar um aparelho ou acessar o ViaCEP. Os comandos de teste usam dependências de desenvolvimento e não fazem parte da interface ou do APK.

## Organização

- tests/services/enderecos.test.ts: validação de entrada, construção da requisição, respostas do ViaCEP e leitura/gravação do histórico.
- tests/hooks/useEnderecoStore.test.ts: integra o hook real com os serviços reais, simulando somente fetch e AsyncStorage. Verifica o comportamento observável e os dados persistidos entre sessões.
- tests/support/enderecos.ts: endereços de exemplo, respostas HTTP mínimas e promessas controláveis.
- jest.setup.cjs: usa o mock fornecido pela biblioteca AsyncStorage.
- jest.config.cjs: preset Expo e coleta de cobertura limitada aos dois módulos desta etapa.

Os arquivos de teste ficam fora de src/app para não serem interpretados como rotas pelo Expo Router. As funções de rede recebem respostas controladas; chamadas não previstas falham em vez de acessar a internet. O armazenamento em memória é limpo antes de cada teste.

## Comportamentos protegidos

| Área | Cenários |
| --- | --- |
| CEP | Máscara, quantidade de dígitos, CEP inexistente, resposta inválida, erro HTTP, rede indisponível e cancelamento |
| Endereço | UF, cidade e logradouro válidos, acentos e caracteres reservados na URL, nenhum resultado e respostas inválidas |
| Histórico | Primeira abertura, dados recuperados, formato inválido e falhas de leitura ou gravação |
| Salvamento | Endereço consultado ou selecionado, deduplicação, ordem e recuperação em nova sessão |
| Exclusão | Remover somente o CEP escolhido e conservar o registro se a gravação falhar |
| Segurança dos dados | Não alterar a lista antes da confirmação da gravação; bloquear mudanças durante carga, erro de histórico ou outra operação |
| Ciclo da consulta | Cancelar após 15 segundos, liberar nova tentativa e cancelar ao desmontar |

As promessas controláveis permitem verificar operações em andamento sem pausas arbitrárias. O teste de tempo limite avança um relógio simulado; não precisa aguardar 15 segundos reais.

## Cobertura e limites

O relatório considera apenas src/services/enderecos.ts e src/hooks/useEnderecoStore.ts. Os percentuais não representam cobertura de todo o aplicativo nem garantem ausência de defeitos.

Esta etapa não cobre componentes e navegação, cópia, abertura real de mapas, permissões/GPS, comportamento visual do teclado, ícone ou splash. Esses fluxos continuam precisando de testes próprios e validação no dispositivo. O mock do AsyncStorage verifica a integração com a API JavaScript, sem testar o mecanismo nativo de armazenamento.

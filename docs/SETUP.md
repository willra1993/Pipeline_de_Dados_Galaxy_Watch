# Guia de configuração

## Pré-requisitos

- Samsung Galaxy Watch com dados sincronizados no Samsung Health;
- aplicativo Health Sync configurado para exportar arquivos CSV;
- conta Google com acesso ao Drive, Sheets e Apps Script;
- Power BI Desktop ou Power BI Service para a visualização final.

## 1. Preparar a exportação

1. No Google Drive, crie uma pasta exclusiva para os CSVs do projeto.
2. No Health Sync, selecione as métricas que serão exportadas.
3. Configure a pasta criada como destino.
4. Defina um prefixo consistente para os nomes dos arquivos, quando essa opção estiver disponível.
5. Faça uma exportação manual e confirme que o CSV abre corretamente.

> [!WARNING]
> Não mova dados reais para este repositório. Mantenha a pasta do Drive privada e restrita à sua conta.

## 2. Criar a planilha

1. Crie uma planilha no Google Sheets.
2. Renomeie a primeira aba para `Dados` ou escolha outro nome e atualize `CONFIG.abaDestino`.
3. Abra **Extensões → Apps Script**.
4. Substitua o conteúdo do editor pelo arquivo [`src/google-apps-script/Code.gs`](../src/google-apps-script/Code.gs).

## 3. Configurar o script

Edite somente o bloco `CONFIG` no início do arquivo:

```javascript
const CONFIG = Object.freeze({
  nomePasta: 'Galaxy Watch - CSV',
  prefixoArquivo: '',
  abaDestino: 'Dados',
  abaControle: '_Controle_Processamento',
  maxArquivosPorExecucao: 20,
  separadorCsv: ',',
});
```

- `nomePasta`: nome exato da pasta de entrada no Drive.
- `prefixoArquivo`: prefixo obrigatório; deixe vazio para aceitar qualquer CSV.
- `abaDestino`: aba que receberá os dados consolidados.
- `abaControle`: aba técnica usada para impedir duplicidades.
- `maxArquivosPorExecucao`: limite de arquivos carregados em cada rodada.
- `separadorCsv`: normalmente `,`; use `;` se esse for o delimitador da exportação.

## 4. Autorizar e testar

1. Selecione a função `consolidarDadosDoGalaxyWatch` no editor.
2. Clique em **Executar**.
3. Autorize o acesso solicitado ao Drive e ao Sheets.
4. Volte à planilha e valide:
   - o cabeçalho aparece uma única vez;
   - as linhas do CSV estão na aba de destino;
   - a aba `_Controle_Processamento` foi criada e ocultada;
   - uma segunda execução não duplica o mesmo arquivo.

Erros e resumos da execução podem ser consultados em **Apps Script → Execuções**.

## 5. Automatizar

1. No Apps Script, abra **Acionadores**.
2. Adicione um acionador para `consolidarDadosDoGalaxyWatch`.
3. Escolha **Baseado no tempo**.
4. Defina uma frequência coerente com a exportação do Health Sync, por exemplo, uma vez por dia.

Também é possível executar a carga pelo menu **Galaxy Watch → Consolidar novos CSVs**, criado automaticamente quando a planilha é aberta.

## 6. Conectar ao Power BI

Use a planilha consolidada como fonte do relatório. Mantenha transformação, nomes de métricas e tipos de dados documentados no próprio arquivo do Power BI. Antes de publicar:

- remova campos que identifiquem a pessoa;
- agregue horários e outras informações sensíveis quando possível;
- revise filtros, tooltips e tabelas detalhadas;
- confirme que nenhuma URL privada ou credencial aparece no relatório.

## Solução de problemas

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| Pasta não encontrada | Nome diferente do `CONFIG` | Copie o nome exato da pasta do Drive |
| CSV ignorado | Prefixo ou extensão divergente | Revise `prefixoArquivo` e o nome do arquivo |
| Colunas desalinhadas | Delimitador incorreto | Ajuste `separadorCsv` para `,` ou `;` |
| Nenhum dado na segunda execução | Arquivo já processado | Comportamento esperado; confira a aba de controle |
| Execução bloqueada | Outra carga ainda está ativa | Aguarde e tente novamente |
| Power BI desatualizado | Atualização da fonte não executada | Atualize o conjunto de dados no Power BI |

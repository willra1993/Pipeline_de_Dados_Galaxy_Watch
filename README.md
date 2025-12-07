⌚📈 Pipeline de Dados Pessoais com Galaxy Watch 7

Este repositório documenta a criação de um pipeline de dados completo, baseado em informações coletadas pelo meu Galaxy Watch 7, com o objetivo de praticar e demonstrar conhecimentos em engenharia e análise de dados, utilizando ferramentas acessíveis e integradas totalmente na nuvem.

🔍 Visão Geral
A proposta deste projeto é mostrar como dados pessoais do dia a dia — como sono, passos, frequência cardíaca e atividades físicas — podem ser utilizados para criar um pipeline automatizado de ponta a ponta, desde a captura dos dados até a visualização em dashboards no Power BI.

⚙️ Tecnologias e Ferramentas Utilizadas
Galaxy Watch 7

- Samsung Health (Android)
- Health Sync (app para sincronização de dados)
- Google Drive (armazenamento dos arquivos CSV)
- Google Apps Script (consolidação automática dos arquivos)
- Google Sheets (fonte de dados para o dashboard)
- Power BI (visualização e análise dos dados)

📊 Resultados
Com este pipeline foi possível construir um painel interativo, atualizado automaticamente, com visões sobre:

- Duração e qualidade do sono
- Frequência cardíaca ao longo do tempo
- Distância percorrida e número de passos
- Tipo e duração das atividades físicas
- Tudo isso com dados reais e pessoais, coletados ao longo dos meus dias.

✨ Objetivo
Este projeto foi criado para fins de aprendizado e demonstração prática de conceitos de:

- Coleta e organização de dados
- Automação com Google Apps Script
- Integração com ferramentas de BI
- Storytelling com dados pessoais

💡 Inspiração
Você não precisa de grandes bases públicas para praticar ou montar seu portfólio. Muitas vezes, os dados que você precisa já estão com você — no seu celular, smartwatch ou outros dispositivos. A criatividade é o ponto de partida!

🙌 Agradecimento
Se este projeto te inspirou ou ajudou de alguma forma, sinta-se à vontade para dar uma ⭐ no repositório ou compartilhar sua própria ideia usando dados pessoais!

📊 Link do Dashboard criado
https://app.powerbi.com/view?r=eyJrIjoiYTYzZmUyMzQtNmMwYy00NjM5LWFhNDEtZTVkYmYzMTRjNGIyIiwidCI6IjExNjBiYzYwLTA4ZTgtNDNhMi1iMTYxLWQ4MDlhZjJlNGJlMyJ9

<details>
  <summary>📜 Script usado para consolidar arquivos no AppScript</summary>

  ```javascript
  function importarCSVstema() {
  const nomePasta = 'NOME_DA_PASTA_NO_GOOGLE_DRIVE'; // Altere aqui
  const prefixoArquivo = 'PREFIXO'; //caso queira somente arquivos com certo padrão na nomencatura/prefixo
  const planilhaDestino = SpreadsheetApp.getActiveSpreadsheet();
  const abaDestino = planilhaDestino.getSheetByName("Planilha1") || planilhaDestino.getSheets()[0];
  
  const pasta = DriveApp.getFoldersByName(nomePasta).next();
  const arquivos = pasta.getFiles();

  const props = PropertiesService.getScriptProperties();
  const arquivosJaProcessados = JSON.parse(props.getProperty("arquivos_processados") || "[]");

  let dadosTotais = [];
  let primeiraLinha = true;
  let arquivosProcessadosAgora = [];

  while (arquivos.hasNext()) {
    const arquivo = arquivos.next();
    const nome = arquivo.getName();

    if (!nome.startsWith(prefixoArquivo) || !nome.endsWith('.csv') || arquivosJaProcessados.includes(nome)) {
      continue;
    }

    const conteudo = arquivo.getBlob().getDataAsString();
    const linhas = Utilities.parseCsv(conteudo);

    for (let i = 0; i < linhas.length; i++) {
      if (i === 0 && !primeiraLinha) continue;
      dadosTotais.push(linhas[i]);
    }

    arquivosProcessadosAgora.push(nome);
    primeiraLinha = false;

    // Se estiver processando muitos arquivos, pode quebrar aqui
    if (dadosTotais.length > 5000) break;
  }

  if (dadosTotais.length > 0) {
    const ultimaLinha = abaDestino.getLastRow();
    abaDestino.getRange(ultimaLinha + 1, 1, dadosTotais.length, dadosTotais[0].length).setValues(dadosTotais);
  }

  // Atualiza a lista de arquivos processados
  props.setProperty("arquivos_processados", JSON.stringify(arquivosJaProcessados.concat(arquivosProcessadosAgora)));
}

/**
 * Consolida arquivos CSV de uma pasta do Google Drive em uma planilha.
 *
 * O script deve ser vinculado a um Google Sheets. Ajuste somente o CONFIG,
 * execute consolidarDadosDoGalaxyWatch uma vez e, depois, crie um gatilho.
 */

const CONFIG = Object.freeze({
  nomePasta: 'Galaxy Watch - CSV',
  prefixoArquivo: '',
  abaDestino: 'Dados',
  abaControle: '_Controle_Processamento',
  maxArquivosPorExecucao: 20,
  separadorCsv: ',',
});

const CABECALHO_CONTROLE = Object.freeze([
  'id_arquivo',
  'nome_arquivo',
  'criado_em',
  'processado_em',
  'status',
  'linhas_importadas',
  'mensagem',
]);

/** Adiciona ações manuais ao menu da planilha. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Galaxy Watch')
    .addItem('Consolidar novos CSVs', 'consolidarDadosDoGalaxyWatch')
    .addItem('Exibir aba de controle', 'exibirAbaDeControle')
    .addToUi();
}

/**
 * Função principal. Pode ser executada manualmente ou por gatilho temporizado.
 * @return {{processados: number, ignorados: number, erros: number, linhas: number}}
 */
function consolidarDadosDoGalaxyWatch() {
  validarConfig_();

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Outra consolidação está em andamento. Tente novamente em alguns instantes.');
  }

  const resumo = { processados: 0, ignorados: 0, erros: 0, linhas: 0 };

  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const pasta = obterPasta_();
    const abaDestino = obterOuCriarAba_(planilha, CONFIG.abaDestino);
    const abaControle = obterOuCriarAbaControle_(planilha);
    const idsConcluidos = carregarIdsConcluidos_(abaControle);
    const arquivos = listarArquivosPendentes_(pasta, idsConcluidos);

    if (arquivos.length === 0) {
      console.log('Nenhum arquivo CSV novo encontrado.');
      return resumo;
    }

    arquivos.forEach(function (arquivo) {
      try {
        const matriz = lerCsv_(arquivo);

        if (matriz.length === 0) {
          registrarExecucao_(abaControle, arquivo, 'IGNORADO', 0, 'Arquivo vazio.');
          resumo.ignorados += 1;
          return;
        }

        const planilhaJaTemCabecalho = abaDestino.getLastRow() > 0;
        const linhasParaImportar = planilhaJaTemCabecalho ? matriz.slice(1) : matriz;

        if (linhasParaImportar.length > 0) {
          const primeiraLinha = abaDestino.getLastRow() + 1;
          abaDestino
            .getRange(primeiraLinha, 1, linhasParaImportar.length, linhasParaImportar[0].length)
            .setValues(linhasParaImportar);
        }

        SpreadsheetApp.flush();
        registrarExecucao_(
          abaControle,
          arquivo,
          'PROCESSADO',
          linhasParaImportar.length,
          'Importação concluída.'
        );

        resumo.processados += 1;
        resumo.linhas += linhasParaImportar.length;
      } catch (erro) {
        const mensagem = erro && erro.message ? erro.message : String(erro);
        registrarExecucao_(abaControle, arquivo, 'ERRO', 0, mensagem);
        resumo.erros += 1;
        console.error('Falha ao processar %s: %s', arquivo.getName(), mensagem);
      }
    });

    console.log('Resumo da consolidação: %s', JSON.stringify(resumo));

    if (resumo.erros > 0) {
      throw new Error(
        resumo.erros + ' arquivo(s) falharam. Consulte a aba de controle e o histórico de execuções.'
      );
    }

    return resumo;
  } finally {
    lock.releaseLock();
  }
}

/** Torna visível a aba técnica de auditoria. */
function exibirAbaDeControle() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = obterOuCriarAbaControle_(planilha);
  aba.showSheet();
  planilha.setActiveSheet(aba);
}

function validarConfig_() {
  if (!CONFIG.nomePasta || !CONFIG.abaDestino || !CONFIG.abaControle) {
    throw new Error('Preencha nomePasta, abaDestino e abaControle no objeto CONFIG.');
  }

  if (CONFIG.abaDestino === CONFIG.abaControle) {
    throw new Error('As abas de destino e controle precisam ter nomes diferentes.');
  }

  if (!Number.isInteger(CONFIG.maxArquivosPorExecucao) || CONFIG.maxArquivosPorExecucao < 1) {
    throw new Error('maxArquivosPorExecucao deve ser um número inteiro maior que zero.');
  }

  if (typeof CONFIG.separadorCsv !== 'string' || CONFIG.separadorCsv.length !== 1) {
    throw new Error('separadorCsv deve conter exatamente um caractere.');
  }
}

function obterPasta_() {
  const pastas = DriveApp.getFoldersByName(CONFIG.nomePasta);

  if (!pastas.hasNext()) {
    throw new Error('Pasta não encontrada no Google Drive: ' + CONFIG.nomePasta);
  }

  const pasta = pastas.next();
  if (pastas.hasNext()) {
    console.warn('Há mais de uma pasta com o nome "%s"; a primeira será usada.', CONFIG.nomePasta);
  }

  return pasta;
}

function obterOuCriarAba_(planilha, nome) {
  return planilha.getSheetByName(nome) || planilha.insertSheet(nome);
}

function obterOuCriarAbaControle_(planilha) {
  const aba = obterOuCriarAba_(planilha, CONFIG.abaControle);

  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, CABECALHO_CONTROLE.length).setValues([CABECALHO_CONTROLE]);
    aba.getRange(1, 1, 1, CABECALHO_CONTROLE.length).setFontWeight('bold');
    aba.setFrozenRows(1);
    aba.autoResizeColumns(1, CABECALHO_CONTROLE.length);
  }

  if (!aba.isSheetHidden()) {
    aba.hideSheet();
  }

  return aba;
}

function carregarIdsConcluidos_(abaControle) {
  const ids = new Set();
  const ultimaLinha = abaControle.getLastRow();

  if (ultimaLinha < 2) {
    return ids;
  }

  const registros = abaControle.getRange(2, 1, ultimaLinha - 1, 5).getValues();
  registros.forEach(function (registro) {
    const id = registro[0];
    const status = registro[4];
    if (id && (status === 'PROCESSADO' || status === 'IGNORADO')) {
      ids.add(String(id));
    }
  });

  return ids;
}

function listarArquivosPendentes_(pasta, idsConcluidos) {
  const arquivos = [];
  const iterador = pasta.getFiles();
  const prefixo = CONFIG.prefixoArquivo || '';

  while (iterador.hasNext()) {
    const arquivo = iterador.next();
    const nome = arquivo.getName();
    const ehCsv = nome.toLowerCase().endsWith('.csv');
    const temPrefixo = nome.startsWith(prefixo);

    if (ehCsv && temPrefixo && !idsConcluidos.has(arquivo.getId())) {
      arquivos.push(arquivo);
    }
  }

  arquivos.sort(function (arquivoA, arquivoB) {
    const diferencaData = arquivoA.getDateCreated().getTime() - arquivoB.getDateCreated().getTime();
    return diferencaData || arquivoA.getName().localeCompare(arquivoB.getName());
  });

  return arquivos.slice(0, CONFIG.maxArquivosPorExecucao);
}

function lerCsv_(arquivo) {
  const conteudo = arquivo.getBlob().getDataAsString('UTF-8').replace(/^\uFEFF/, '');
  const linhas = Utilities.parseCsv(conteudo, CONFIG.separadorCsv);
  return normalizarMatriz_(linhas);
}

function normalizarMatriz_(linhas) {
  const linhasComConteudo = linhas.filter(function (linha) {
    return linha.some(function (valor) {
      return String(valor).trim() !== '';
    });
  });

  if (linhasComConteudo.length === 0) {
    return [];
  }

  const largura = linhasComConteudo.reduce(function (maior, linha) {
    return Math.max(maior, linha.length);
  }, 0);

  return linhasComConteudo.map(function (linha) {
    const normalizada = linha.slice(0, largura);
    while (normalizada.length < largura) {
      normalizada.push('');
    }
    return normalizada;
  });
}

function registrarExecucao_(abaControle, arquivo, status, linhasImportadas, mensagem) {
  abaControle.appendRow([
    arquivo.getId(),
    arquivo.getName(),
    arquivo.getDateCreated(),
    new Date(),
    status,
    linhasImportadas,
    String(mensagem || '').slice(0, 500),
  ]);
}

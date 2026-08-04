# Segurança e privacidade

## Escopo

Este projeto processa dados de saúde e atividade física. Embora o repositório contenha somente código e documentação, uma implantação real pode acessar informações sensíveis no Google Drive, Google Sheets e Power BI.

## Reporte responsável

Não abra uma issue pública se encontrar:

- credencial, token ou identificador privado exposto;
- dado pessoal ou de saúde publicado por engano;
- configuração que permita acesso indevido ao Drive, Sheets ou Power BI;
- vulnerabilidade que possa comprometer uma implantação do pipeline.

Use um [aviso privado de segurança do GitHub](https://github.com/willra1993/Pipiline_de_Dados_Galaxy_Watch/security/advisories/new) e descreva o impacto, os passos para reprodução e uma sugestão de correção, se houver.

## Boas práticas para quem reproduzir o projeto

- Restrinja a pasta do Drive e a planilha à menor quantidade possível de pessoas.
- Revise permissões concedidas ao Apps Script.
- Não armazene tokens ou IDs privados diretamente no código versionado.
- Use dados sintéticos em testes, issues e pull requests.
- Remova ou agregue localização, horário preciso e identificadores antes da publicação.
- Revise todas as páginas, filtros e tooltips do Power BI antes de tornar o relatório público.
- Revogue imediatamente qualquer segredo exposto e remova-o também do histórico do Git.

## Dados no repositório

Arquivos CSV reais, planilhas exportadas, bancos locais, variáveis de ambiente e credenciais são ignorados por padrão no `.gitignore`. Essa proteção reduz erros acidentais, mas não substitui a revisão do conteúdo antes de cada commit.

# Como contribuir

Obrigado pelo interesse em melhorar este projeto. Contribuições são bem-vindas quando preservam a privacidade dos dados e mantêm o pipeline simples de reproduzir.

## Antes de abrir uma contribuição

1. Pesquise as issues existentes para evitar duplicidade.
2. Abra uma issue para mudanças relevantes de arquitetura ou comportamento.
3. Nunca anexe exportações reais do Samsung Health, planilhas pessoais, credenciais ou links privados.

## Desenvolvimento

1. Faça um fork do repositório.
2. Crie uma branch curta e descritiva a partir de `main`.
3. Faça alterações pequenas e focadas.
4. Valide a sintaxe do arquivo `Code.gs` e revise a documentação afetada.
5. Use dados sintéticos ao demonstrar entradas ou resultados.
6. Abra um pull request preenchendo o template.

## Padrões esperados

- Prefira nomes claros e comentários que expliquem decisões, não instruções óbvias.
- Mantenha as opções ajustáveis no objeto `CONFIG`.
- Preserve a idempotência: executar a carga novamente não deve duplicar arquivos concluídos.
- Trate falhas por arquivo sem apagar dados já consolidados.
- Atualize o README e os documentos quando o fluxo ou a configuração mudar.
- Use commits objetivos, preferencialmente no padrão Conventional Commits, como `docs: improve setup guide`.

## Checklist local

- [ ] O JavaScript está sintaticamente válido.
- [ ] O README continua com links e diagramas válidos.
- [ ] Nenhum dado pessoal ou segredo foi incluído.
- [ ] O comportamento foi testado manualmente no Apps Script, quando aplicável.
- [ ] A alteração mantém compatibilidade com o runtime V8.

## Relato de falhas

Use o template de bug para problemas funcionais. Para vulnerabilidades, exposição de dados ou credenciais, siga [SECURITY.md](SECURITY.md) e não abra uma issue pública.

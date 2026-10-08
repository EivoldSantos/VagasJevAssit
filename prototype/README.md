# Prototype MV3 (Phase 1)

Extensão **unpacked** para prova de viabilidade (listagem + fill fictício).

## Carregar no Chrome

1. `chrome://extensions` → **Modo do desenvolvedor**
2. **Carregar sem compactação** → pasta `prototype/`
3. Com o [lab](../lab/) em `http://127.0.0.1:5173`, abra o popup nesta aba

## Verificação local

```bash
node scripts/verify-manifest.mjs
npm test
```

(`npm test` na pasta `prototype/` — testes Node em `lib/*.test.js`.)

## Gate manual (lab — D-14)

1. Subir lab: `npm run dev` em `lab/` → **127.0.0.1:5173**
2. Popup → **Preencher fictício** → conferir `verifiedSummary` no JSON
3. No lab, clicar **Forçar re-render**
4. Confirmar que o label do **Campo React controlado** ainda mostra o valor fictício
5. No DevTools da aba do lab: `window.__LAB_SUBMIT_FIRED__` deve ser **`false`** (ou `undefined`) após LIST+FILL — nunca `true`

## Páginas restritas

Em `chrome://extensions`, **Listar campos** deve mostrar erro legível — ver [docs/restricted-pages.md](../docs/restricted-pages.md).

## Arquitetura

- Permissões: `activeTab`, `scripting`, `storage`
- Injeção: `background.js` → `executeScript` com `lib/*.js` + `scripts/form-agent.js`
- Sem `content_scripts` globais, sem WXT, sem protocolo de debug do Chrome no fill

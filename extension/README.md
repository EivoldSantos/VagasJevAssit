# VagasJevAssist — extensão (WXT)

Extensão definitiva em **Manifest V3** com **Side Panel**.

## Desenvolvimento

```bash
npm install
npm run dev
```

Carregue a pasta indicada pelo WXT (geralmente `.output/chrome-mv3-dev`) em `chrome://extensions` → **Carregar sem compactação**.

## Produção

```bash
npm run build
node scripts/verify-manifest.mjs
```

Carregue `.output/chrome-mv3` no Chrome.

## Testar Analisar formulário

1. Subir o lab: `npm --prefix ../lab run dev` → http://127.0.0.1:5173
2. Abrir o Side Panel pelo ícone da extensão
3. **Recarregue a aba do lab** (F5) após atualizar a extensão — o content script do lab só entra no carregamento da página.
4. Seção **Candidatura** → **Analisar formulário**

## Teste manual — aba restrita

Em `chrome://extensions`, abra o painel e clique **Analisar** — deve aparecer erro legível, sem crash.

## Autopreencher

Botão visível porém desabilitado até Phase 4 (motor determinístico).

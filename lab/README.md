# Laboratório (Phase 1)

Formulário React mínimo para testar a extensão em `../prototype/`.

## Subir o servidor

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). A porta **5173** é fixa (`strictPort`).

Se a porta estiver ocupada, encerre o processo que usa 5173 ou ajuste temporariamente o Vite — o **gate da Phase 1** assume **127.0.0.1:5173**.

## Build

```bash
npm run build
```

## Smoke FORM-06 (inject atrasado)

1. Suba o lab (`npm run dev`) e abra o painel da extensão na aba do formulário.
2. Altere o select **País** — após ~300ms aparece **Cidade (após select + 300ms)**.
3. Clique **Autopreencher** logo após mudar o país (durante o delay): o campo atrasado não deve receber fill incorreto em nó stale; resultados podem mostrar `STALE`/`SKIPPED` ou omitir o campo ainda inexistente no snapshot.
4. Aguarde o campo aparecer e clique **Autopreencher** de novo (ou **Analisar** + **Autopreencher**): preencha se o matcher reconhecer o label.
5. Confirme que o submit guard `__LAB_SUBMIT_FIRED__` não dispara ao autopreencher.

## Gate manual Phase 4 (D-14)

Checklist numerado antes de fechar a fase / iniciar BYOK (IA desligada ou sem chave):

1. **Perfil salvo** — em Perfil da extensão, nome completo **ou** e-mail preenchidos e salvos.
2. **Lab :5173** — `npm run dev` no `lab/`; aba do formulário ativa; painel lateral aberto.
3. **Matriz básica** — Autopreencher preenche nome, e-mail, celular, cidade, LinkedIn quando o perfil tem valores; campos **ocultos** ou **disabled** da matriz aparecem como SKIP (não sobrescrevem).
4. **Pré-fill manual (R5 / UX-03)** — digite um valor em um campo de texto vazio, depois Autopreencher: o valor manual permanece (SKIP / preservado).
5. **Submit guard (R3)** — após Autopreencher, `window.__LAB_SUBMIT_FIRED__` permanece `false`; nenhum envio acidental.
6. **ControlledField React (R4)** — campo controlado do lab: se o React rejeitar o valor, o resultado no painel mostra FAILED ou STALE, nunca FILLED não verificado.
7. **Inject atrasado ~300 ms (R6 / FORM-06)** — mude o select País e Autopreencher durante o delay: sem fill em nó stale; após o campo “Cidade (após select + 300ms)” aparecer, Analisar + Autopreencher de novo se necessário.
8. **Offline sem IA** — sem provedor BYOK configurado: Autopreencher ainda preenche campos determinísticos; campos desconhecidos não recebem texto inventado.
9. **Lista de resultados (D-04)** — após Autopreencher, a seção “Resultado do autopreenchimento” lista cada campo com badge de status (FILLED, SKIPPED, FAILED, STALE, …), label e motivo quando não verificado.
10. **Senha / token (R1)** — campo senha não é preenchido; classificador marca sensível.

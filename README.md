# VagasJevAssist

Extensão para **Google Chrome** que ajuda você a **preencher formulários de candidatura** na mesma aba em que já está logado — Greenhouse, Gupy, Workday e páginas similares.

Você abre a vaga, faz login se precisar, analisa os campos pelo painel da extensão e dispara o autopreenchimento quando quiser. **A extensão não envia a candidatura por você:** revisão e clique final continuam seus.

## Por que existe

Candidatar-se em massa vira copiar e colar, errar campo e perder tempo em formulários longos. O VagasJevAssist junta:

- **Perfil e currículo no navegador** (local, sem servidor obrigatório)
- **Preenchimento determinístico** quando o campo é óbvio
- **IA opcional (BYOK)** só quando o matcher não resolve — com sua própria chave de API

O foco é **poucos sites bem feitos**, com preenchimento **verificável**, não um robô genérico que clica em “Enviar”.

## Como funciona (visão do usuário)

1. Instala a extensão e cadastra (ou importa) seus dados profissionais.
2. Abre manualmente a página da vaga e autentica se a plataforma exigir.
3. Abre o **painel lateral** da extensão.
4. Clica em **Analisar formulário** — a extensão lista os campos da página atual.
5. Clica em **Autopreencher** — campos conhecidos são preenchidos; o restante você resolve ou usa IA conforme configurado.
6. **Você** revisa e submete a candidatura.

## O que tem neste repositório

| Pasta | Função |
|--------|--------|
| [`lab/`](lab/) | Formulário de teste local (React) para desenvolver leitura e preenchimento |
| [`prototype/`](prototype/) | Extensão Chrome experimental (MV3) usada hoje no desenvolvimento |

A extensão definitiva (WXT, painel lateral de produto) ainda está em evolução; o `prototype/` serve para validar a ideia no lab antes disso.

### Testar localmente

1. Subir o lab:

   ```bash
   npm --prefix lab install
   npm --prefix lab run dev
   ```

   Abra [http://127.0.0.1:5173](http://127.0.0.1:5173).

2. No Chrome: `chrome://extensions` → **Modo do desenvolvedor** → **Carregar sem compactação** → pasta `prototype/`.

3. Com a aba do lab ativa, abra o popup da extensão → **Listar campos** / **Preencher fictício**.

Mais detalhes em [`lab/README.md`](lab/README.md) e [`prototype/README.md`](prototype/README.md).

## Princípios

- **Só com sua ação** — nada roda em segundo plano sem você pedir.
- **Na aba real** — sem navegador automatizado separado nem automação de login.
- **Dados no seu navegador** — local-first; chave de IA é BYOK quando existir.
- **Sem envio automático** — candidatura sempre manual.

## Licença

A definir.

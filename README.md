# VagasJevAssist

Extensão Chrome (Manifest V3) para autopreenchimento de candidaturas de emprego. O candidato abre a vaga manualmente, autentica quando necessário e inicia o preenchimento pela extensão. A candidatura **nunca** é enviada automaticamente.

Este repositório ainda não contém código da extensão. A constituição do produto e o planejamento GSD já estão gravados.

## Documentos

| Documento | Função |
|-----------|--------|
| [docs/SPEC.md](docs/SPEC.md) | Constituição do produto — fonte da verdade |
| [.planning/PROJECT.md](.planning/PROJECT.md) | Contexto, valor central e decisões |
| [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) | Requisitos rastreáveis |
| [.planning/ROADMAP.md](.planning/ROADMAP.md) | Fases 1–7 do MVP |
| [.planning/STATE.md](.planning/STATE.md) | Estado atual do planejamento |

Se um artefato em `.planning/` divergir de `docs/SPEC.md`, a spec canônica vence até os dois serem atualizados de propósito.

## Princípios

- **User-initiated** — toda execução começa com ação explícita do usuário
- **Browser-native** — atua na aba original, sem Chrome automatizado separado
- **Local-first** — perfil e histórico ficam no navegador
- **BYOK** — o usuário fornece a própria chave de IA
- **Human-in-the-loop** — o candidato revisa e envia a candidatura

## Próximo passo

A Phase 1 (prova de viabilidade técnica) está pronta para discussão de implementação:

```text
/gsd-discuss-phase 1
```

A Phase 2 (fundação WXT) só começa se o Gate da Phase 1 passar.

## Fora deste repositório, por enquanto

Não há scaffold WXT, manifesto, testes nem ícones. Isso entra na Phase 2, depois da prova de preenchimento real na aba do candidato.

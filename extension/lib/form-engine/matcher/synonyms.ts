/** Canonical profile paths with normalized pt/en aliases (D-09, D-11). */
export type SynonymEntry = {
  profilePath: string;
  aliases: string[];
};

export const PROFILE_FIELD_SYNONYMS: SynonymEntry[] = [
  {
    profilePath: "personalInfo.email",
    aliases: [
      "email",
      "e mail",
      "email address",
      "correio eletronico",
      "endereco de email",
      "mail",
    ],
  },
  {
    profilePath: "personalInfo.fullName",
    aliases: [
      "nome completo",
      "nome",
      "full name",
      "name",
      "seu nome",
      "your name",
    ],
  },
  {
    profilePath: "personalInfo.phone",
    aliases: [
      "telefone",
      "phone",
      "celular",
      "mobile",
      "whatsapp",
      "numero de telefone",
      "phone number",
      "fone",
      "tel",
      "telefone celular",
      "mobile phone",
      "cel",
      "whatsapp number",
      "numero celular",
    ],
  },
  {
    profilePath: "personalInfo.city",
    aliases: [
      "city",
      "cidade",
      "municipio",
      "localidade",
      "local",
      "town",
      "cidade estado",
    ],
  },
  {
    profilePath: "personalInfo.linkedin",
    aliases: [
      "linkedin",
      "linked in",
      "linkedin url",
      "linkedin profile",
      "perfil linkedin",
      "url linkedin",
      "url do perfil",
      "perfil profissional",
      "link linkedin",
    ],
  },
];

/** Fast lookup: normalized alias → profile path. */
export const ALIAS_TO_PROFILE_PATH: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const entry of PROFILE_FIELD_SYNONYMS) {
    for (const alias of entry.aliases) {
      map[alias] = entry.profilePath;
    }
  }
  return map;
})();

/** @deprecated use ALIAS_TO_PROFILE_PATH — kept for incremental migration */
export const LABEL_TO_PROFILE_PATH = ALIAS_TO_PROFILE_PATH;

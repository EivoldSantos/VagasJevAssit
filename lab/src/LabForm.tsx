import { FormEvent, useState } from "react";
import ControlledField from "./ControlledField";

declare global {
  interface Window {
    __LAB_SUBMIT_FIRED__?: boolean;
  }
}

type DynamicField = { id: string; name: string };

export default function LabForm() {
  const [formKey, setFormKey] = useState(0);
  const [showConditional, setShowConditional] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicSeq, setDynamicSeq] = useState(0);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.__LAB_SUBMIT_FIRED__) {
      throw new Error("SEC-02: submit disparou durante testes");
    }
    window.__LAB_SUBMIT_FIRED__ = true;
  };

  const addDynamicField = () => {
    const n = dynamicSeq + 1;
    setDynamicSeq(n);
    setDynamicFields((prev) => [
      ...prev,
      { id: `dynamic_${n}`, name: `dynamic_${n}` },
    ]);
  };

  return (
    <>
      <p>
        <button type="button" onClick={() => setFormKey((k) => k + 1)}>
          Forçar re-render
        </button>{" "}
        <button type="button" onClick={() => setShowConditional((v) => !v)}>
          {showConditional ? "Ocultar" : "Mostrar"} campos condicionais
        </button>{" "}
        <button type="button" onClick={addDynamicField}>
          Adicionar campo
        </button>
      </p>

      <form
        id="lab-application-form"
        key={formKey}
        onSubmit={onSubmit}
      >
        <label htmlFor="full_name">Nome completo</label>
        <input id="full_name" name="full_name" type="text" required />

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="phone">Telefone</label>
        <input id="phone" name="phone" type="tel" />

        <label htmlFor="bio">Sobre você</label>
        <textarea id="bio" name="bio" rows={3} />

        <label htmlFor="country">País</label>
        <select id="country" name="country" defaultValue="BR">
          <option value="BR">Brasil</option>
          <option value="PT">Portugal</option>
        </select>

        <fieldset>
          <legend>Modalidade</legend>
          <label>
            <input type="radio" name="work_mode" value="remote" defaultChecked /> Remoto
          </label>
          <label>
            <input type="radio" name="work_mode" value="hybrid" /> Híbrido
          </label>
        </fieldset>

        <label>
          <input type="checkbox" name="terms" /> Aceito os termos (opcional no lab)
        </label>

        <ControlledField />

        {showConditional && (
          <div id="conditional-block">
            <label htmlFor="conditional_city">Cidade (condicional)</label>
            <input id="conditional_city" name="conditional_city" type="text" />
          </div>
        )}

        {dynamicFields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id}>Campo dinâmico {f.name}</label>
            <input id={f.id} name={f.name} type="text" />
          </div>
        ))}

        <p style={{ marginTop: "1.5rem" }}>
          <button type="submit" id="submit_application">
            Enviar candidatura (lab)
          </button>
        </p>
      </form>
    </>
  );
}

import { useState } from "react";

export default function ControlledField() {
  const [value, setValue] = useState("");

  return (
    <div>
      <label htmlFor="controlled_note">
        Campo React controlado: <span id="controlled_label">{value || "(vazio)"}</span>
      </label>
      <input
        id="controlled_note"
        name="controlled_note"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Nota controlada React"
      />
    </div>
  );
}

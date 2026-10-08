import { useState, type ReactNode } from "react";

type Props<T> = {
  items: T[];
  title: string;
  emptyLabel: string;
  renderItem: (item: T, index: number) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function RepeatableList<T>({
  items,
  title,
  emptyLabel,
  renderItem,
  onAdd,
  onRemove,
}: Props<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    items.length > 0 ? 0 : null,
  );

  return (
    <div className="repeatable-list">
      <div className="repeatable-header">
        <h3>{title}</h3>
        <button type="button" className="secondary-btn" onClick={onAdd}>
          Adicionar
        </button>
      </div>
      {items.length === 0 && <p className="muted">{emptyLabel}</p>}
      {items.map((item, index) => (
        <details
          key={index}
          className="repeatable-item"
          open={openIndex === index}
          onToggle={(e) => {
            if ((e.target as HTMLDetailsElement).open) setOpenIndex(index);
          }}
        >
          <summary>
            Item {index + 1}
            <button
              type="button"
              className="link-btn"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm("Remover este item?")) onRemove(index);
              }}
            >
              Remover
            </button>
          </summary>
          <div className="repeatable-body">{renderItem(item, index)}</div>
        </details>
      ))}
    </div>
  );
}

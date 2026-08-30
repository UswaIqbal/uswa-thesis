interface RadioOption<T extends string> {
  value: T;
  label: string;
  id?: string;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  ariaLabel: string;
}

export function RadioGroup<T extends string>({
  options,
  selected,
  onSelect,
  ariaLabel,
}: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((opt) => {
        const checked = selected === opt.value;
        return (
          <button
            key={opt.value}
            id={opt.id}
            type="button"
            role="radio"
            aria-checked={checked}
            className="radio-row"
            onClick={() => onSelect(opt.value)}
          >
            <span className="radio-dot">{checked && <span className="radio-dot-fill" />}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AccentPicker({ accent, options, onChange }) {
  return (
    <div className="rc-accent-picker" role="group" aria-label="Accent color">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={
            "rc-accent-swatch" + (option.id === accent.id ? " active" : "")
          }
          style={{ background: option.base }}
          onClick={() => onChange(option.id)}
          title={option.label}
          aria-label={option.label}
          aria-pressed={option.id === accent.id}
        />
      ))}
    </div>
  );
}

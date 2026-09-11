interface InputFieldProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`focus:ring-primary-green/15 focus:border-primary-green border-border-subtle bg-surface-subtle text-text-primary placeholder:text-text-muted focus:bg-surface w-full rounded-xl border px-3 py-2 text-xs outline-hidden transition-all focus:ring-2 ${className || ''}`}
    />
  );
};

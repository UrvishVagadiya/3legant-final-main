interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className = "",
  inputClassName,
}: FormFieldProps) {
  const baseInput =
    inputClassName ??
    `w-full border rounded px-4 py-3 outline-none transition-colors ${
      error
        ? "border-red-500 bg-red-50 focus:border-red-600"
        : "border-gray-300 focus:border-black bg-white"
    }`;

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={baseInput}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

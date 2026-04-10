interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder,
  className = "",
}: SelectFieldProps) {
  const inputClass = `w-full border rounded px-4 py-3 outline-none transition-colors appearance-none cursor-pointer ${
    error
      ? "border-red-500 bg-red-50 focus:border-red-600"
      : "border-gray-300 focus:border-black bg-white"
  }`;

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export const countryOptions = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "IN", label: "India" },
];

import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  oldPassword: string;
  newPassword: string;
  repeatNewPassword: string;
};

interface AccountDetailsProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

const Field = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  disabled,
  hint,
  validate,
}: {
  label: string;
  name: keyof FormData;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  validate?: any;
}) => {
  const inputClass = `w-full border rounded-[6px] px-4 py-3 outline-none transition-colors ${errors[name]
    ? "border-red-500"
    : "border-gray-300 focus:border-black bg-white"
    }`;
  const required = label.includes("*")
    ? `${label.replace(" *", "").replace("*", "").trim()} is required`
    : undefined;

  return (
    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, {
          ...(required ? { required } : {}),
          ...(validate ? { validate } : {}),
        })}
        className={inputClass}
      />
      {hint && <p className="text-[14px] text-[#6C7275] mt-2 italic">{hint}</p>}
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};

const AccountDetails = ({
  register,
  errors,
  watch,
  isSubmitting,
  onSubmit,
}: AccountDetailsProps) => (
  <form onSubmit={onSubmit}>
    <h1 className="font-semibold text-[20px] mb-6">Account Details</h1>

    {errors.root && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
        {errors.root.message}
      </div>
    )}

    <Field
      label="FIRST NAME *"
      name="firstName"
      register={register}
      errors={errors}
      placeholder="First name"
    />
    <Field
      label="LAST NAME *"
      name="lastName"
      register={register}
      errors={errors}
      placeholder="Last name"
    />
    <Field
      label="Display Name *"
      name="displayName"
      register={register}
      errors={errors}
      placeholder="Display name"
      hint="This will be how your name will be displayed in the account section and in reviews"
    />
    <div className="mb-10">
      <Field
        label="EMAIL *"
        name="email"
        register={register}
        errors={errors}
        type="email"
        placeholder="Email"
        disabled
        validate={(value: string) => {
          if (value && !/\S+@\S+\.\S+/.test(value))
            return "Email format is invalid";
          return true;
        }}
      />
    </div>

    <h1 className="font-semibold text-xl mb-6">Password</h1>

    <Field
      label="OLD PASSWORD"
      name="oldPassword"
      register={register}
      errors={errors}
      type="password"
      placeholder="Old password"
      validate={(value: string) => {
        if (watch("newPassword") && !value)
          return "Old password is required to set a new password";
        return true;
      }}
    />
    <Field
      label="NEW PASSWORD"
      name="newPassword"
      register={register}
      errors={errors}
      type="password"
      placeholder="New password"
      validate={(value: string) => {
        if (watch("oldPassword") && !value)
          return "New password is required if old password is provided";
        if (watch("oldPassword") && value === watch("oldPassword"))
          return "New password cannot be the same as the old password";
        return true;
      }}
    />
    <div className="mb-8">
      <Field
        label="REPEAT NEW PASSWORD"
        name="repeatNewPassword"
        register={register}
        errors={errors}
        type="password"
        placeholder="Repeat new password"
        validate={(value: string) => {
          if (watch("newPassword") && !value)
            return "Please repeat your new password";
          if (watch("newPassword") && value !== watch("newPassword"))
            return "Passwords do not match";
          return true;
        }}
      />
    </div>

    <button
      type="submit"
      disabled={isSubmitting}
      className="w-fit px-10 py-3 rounded-lg bg-[#141718] flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-800 transition-colors"
    >
      <span className="text-white font-medium text-sm md:text-base">
        {isSubmitting ? "Saving..." : "Save changes"}
      </span>
    </button>
  </form>
);

export default AccountDetails;

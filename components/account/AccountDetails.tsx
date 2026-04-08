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

    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        FIRST NAME *
      </label>
      <input
        {...register("firstName", { required: "First name is required" })}
        placeholder="First name"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.firstName
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.firstName?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.firstName.message)}
        </p>
      )}
    </div>

    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        LAST NAME *
      </label>
      <input
        {...register("lastName", { required: "Last name is required" })}
        placeholder="Last name"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.lastName
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.lastName?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.lastName.message)}
        </p>
      )}
    </div>

    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        Display Name *
      </label>
      <input
        {...register("displayName", { required: "Display name is required" })}
        placeholder="Display name"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.displayName
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      <p className="text-[14px] text-[#6C7275] mt-2 italic">
        This will be how your name will be displayed in the account section and
        in reviews
      </p>
      {errors.displayName?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.displayName.message)}
        </p>
      )}
    </div>

    <div className="mb-10">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        EMAIL *
      </label>
      <input
        type="email"
        disabled
        {...register("email", {
          required: "Email is required",
          validate: (value: string) => {
            if (value && !/\S+@\S+\.\S+/.test(value)) {
              return "Email format is invalid";
            }
            return true;
          },
        })}
        placeholder="Email"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.email
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.email?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.email.message)}
        </p>
      )}
    </div>

    <h1 className="font-semibold text-xl mb-6">Password</h1>

    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        OLD PASSWORD
      </label>
      <input
        type="password"
        {...register("oldPassword", {
          validate: (value: string) => {
            if (watch("newPassword") && !value) {
              return "Old password is required to set a new password";
            }
            return true;
          },
        })}
        placeholder="Old password"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.oldPassword
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.oldPassword?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.oldPassword.message)}
        </p>
      )}
    </div>

    <div className="mb-6">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        NEW PASSWORD
      </label>
      <input
        type="password"
        {...register("newPassword", {
          validate: (value: string) => {
            if (watch("oldPassword") && !value) {
              return "New password is required if old password is provided";
            }
            if (watch("oldPassword") && value === watch("oldPassword")) {
              return "New password cannot be the same as the old password";
            }
            return true;
          },
        })}
        placeholder="New password"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.newPassword
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.newPassword?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.newPassword.message)}
        </p>
      )}
    </div>

    <div className="mb-8">
      <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
        REPEAT NEW PASSWORD
      </label>
      <input
        type="password"
        {...register("repeatNewPassword", {
          validate: (value: string) => {
            if (watch("newPassword") && !value) {
              return "Please repeat your new password";
            }
            if (watch("newPassword") && value !== watch("newPassword")) {
              return "Passwords do not match";
            }
            return true;
          },
        })}
        placeholder="Repeat new password"
        className={`w-full border rounded-md px-4 py-3 outline-none transition-colors ${
          errors.repeatNewPassword
            ? "border-red-500"
            : "border-gray-300 focus:border-black bg-white"
        }`}
      />
      {errors.repeatNewPassword?.message && (
        <p className="text-red-500 text-xs pt-2">
          {String(errors.repeatNewPassword.message)}
        </p>
      )}
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

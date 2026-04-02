"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { typography } from "@/constants/typography";

const supabase = createClient();

type FormInputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setMessage("");
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to sign in...");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    }
  };

  return (
    <AuthLayout>
      <h1 className={`${typography.h5} mb-2 md:mb-3 text-black`}>
        Set New Password
      </h1>

      <p className={`${typography.text16} text-gray-500 mb-4 md:mb-8`}>
        Please enter your new password below.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 bg-green-100 text-green-700 rounded-md ${typography.text14}`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-8 flex flex-col font-inter w-full"
      >
        <div className="flex flex-col relative group">
          <input
            type="password"
            {...register("password", {
              required: "Password required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            placeholder="New Password"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-xs pt-2">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col relative group">
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === watch("password") || "Passwords do not match",
            })}
            placeholder="Confirm Password"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs pt-2">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-black text-white rounded-lg py-3 ${typography.buttonSmall} hover:bg-gray-800 transition-colors`}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </AuthLayout>
  );
}

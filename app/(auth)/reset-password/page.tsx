"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { typography } from "@/constants/typography";

const supabase = createClient();

type FormInputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [linkChecked, setLinkChecked] = useState(false);
  const [linkError, setLinkError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  useEffect(() => {
    const initRecoverySession = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        let sessionReady = false;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            sessionReady = true;
          }
        }

        if (!sessionReady) {
          const hashParams = new URLSearchParams(
            window.location.hash.replace(/^#/, ""),
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          const type = hashParams.get("type");

          if (type === "recovery" && accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              sessionReady = true;
            }
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && !sessionReady) {
          setLinkError(
            "This reset link is invalid or expired. Please request a new one.",
          );
        } else {
          setLinkError("");
          window.history.replaceState({}, "", "/reset-password");
        }
      } catch {
        setLinkError("Unable to verify reset link. Please request a new one.");
      } finally {
        setLinkChecked(true);
      }
    };

    initRecoverySession();
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setMessage("");
    clearErrors("password");

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setError("password", {
        type: "manual",
        message: error.message || "Unable to reset password. Please try again.",
      });
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

      {linkChecked && linkError && (
        <div
          className={`mb-4 p-3 bg-red-100 text-red-700 rounded-md ${typography.text14}`}
        >
          {linkError}
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
          disabled={isSubmitting || !linkChecked || !!linkError}
          className={`w-full bg-black text-white rounded-lg py-3 ${typography.buttonSmall} hover:bg-gray-800 transition-colors`}
        >
          {isSubmitting
            ? "Updating..."
            : !linkChecked
              ? "Verifying link..."
              : "Update Password"}
        </button>
      </form>
    </AuthLayout>
  );
}

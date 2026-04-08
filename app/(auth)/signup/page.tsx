"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { typography } from "@/constants/typography";
import toast from "react-hot-toast";
const supabase = createClient();

type FormInputs = {
  name: string;
  username: string;
  email: string;
  password: string;
  terms: boolean;
};

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!data.terms) {
      toast.error("You must accept terms");
      return;
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    try {
      const { data: existing, error: statusError } = await supabase
        .from("user_status")
        .select("email, is_verified")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!statusError && existing?.email) {
        if (existing.is_verified) {
          setExistingUserEmail(normalizedEmail);
          setShowExistingUserModal(true);
          return;
        }

        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email: normalizedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/signin`,
          },
        });

        if (resendError) {
          toast.error(
            resendError.message ||
              "Unable to resend verification link. Please try again.",
          );
          return;
        }

        toast.success(
          "Your account is not verified yet. We sent a new verification link.",
        );
        return;
      }
    } catch {
      // Fall through to normal signup if status check fails.
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: {
          name: data.name,
          full_name: data.name,
          username: data.username,
        },
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });
    if (error) {
      console.error("Signup error details:", error);
      toast.error(
        `Signup failed: ${error.message}${error.status ? ` (Status: ${error.status})` : ""}`,
      );
    } else {
      toast.success(
        "Signup successful! Please check your email for a confirmation link.",
      );
      router.push("/signin");
    }
  };

  return (
    <AuthLayout>
      <h1 className={`${typography.h5} mb-2 md:mb-3 text-black`}>Sign up</h1>

      <p className={`${typography.text16} text-gray-500 mb-4 md:mb-8`}>
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-[#38cb89] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-2 md:space-y-6 flex flex-col font-inter w-full"
      >
        <div>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Your name"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.name && (
            <p className="pt-2 text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>
        <div>
          <input
            {...register("username", { required: "Username is required" })}
            placeholder="Username"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.username && (
            <p className="pt-2 text-red-500 text-xs">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Email address"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.email && (
            <p className="pt-2 text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="flex  flex-col relative group">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
            placeholder="Password"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute cursor-pointer right-0 top-3 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
          {errors.password && (
            <p className="pt-2 text-red-500 text-xs">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register("terms")}
            className="w-5 h-5 cursor-pointer border-gray-300 rounded text-black focus:ring-black accent-black"
          />
          <label
            htmlFor="terms"
            className={`${typography.text14} text-gray-500 leading-snug`}
          >
            I agree with{" "}
            <Link
              href="/privacy"
              className="font-semibold text-black hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="font-semibold text-black hover:underline"
            >
              Terms of Use
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full cursor-pointer bg-black text-white rounded-lg py-3 ${typography.buttonSmall} hover:bg-gray-800 transition-colors`}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {showExistingUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[#141718] mb-2">
              Account already exists
            </h2>
            <p className="text-sm text-[#6C7275] mb-6 leading-6">
              {existingUserEmail} is already registered and verified. Please sign
              in to continue.
            </p>
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="w-full bg-[#141718] text-white rounded-lg py-3 text-sm font-medium hover:bg-black transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

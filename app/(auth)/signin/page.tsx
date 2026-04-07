"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { typography } from "@/constants/typography";

const supabase = createClient();

type FormInputs = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    clearErrors("password");

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const message = error.message
        .toLowerCase()
        .includes("invalid login credentials")
        ? "Invalid email or password"
        : error.message;

      setError("password", {
        type: "server",
        message,
      });
    } else {
      router.push("/");
    }
  };

  return (
    <AuthLayout>
      <h1 className={`${typography.h5} mb-2 md:mb-3 text-black`}>Sign In</h1>

      <p className={`${typography.text16} text-gray-500 mb-4 md:mb-8`}>
        Don&apos;t have an account yet?{" "}
        <Link
          href="/signup"
          className="text-[#38cb89] font-medium hover:underline"
        >
          Sign Up
        </Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-8 flex flex-col font-inter w-full"
      >
        <div>
          <input
            type="email"
            {...register("email", { required: "Email required" })}
            placeholder="Email address"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs pt-2">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col relative group">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Password required" })}
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
            <p className="text-red-500 text-xs pt-2">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="remember"
              className="w-5 h-5 cursor-pointer border-gray-300 rounded text-black focus:ring-black accent-black"
            />
            <label
              htmlFor="remember"
              className={`${typography.text14} text-gray-500 cursor-pointer`}
            >
              Remember me
            </label>
          </div>

          <Link
            href="/forgot-password"
            className={`${typography.text14Semibold} text-black hover:underline`}
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-black cursor-pointer text-white rounded-lg py-3 ${typography.buttonSmall} hover:bg-gray-800 transition-colors`}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>

      </form>
    </AuthLayout>
  );
}

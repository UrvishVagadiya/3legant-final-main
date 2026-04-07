"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
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

    const { error } = await supabase.auth.signUp({
      email: data.email,
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

        <div>
          <input
            type="password"
            {...register("password", {
              required: "Password required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
            placeholder="Password"
            className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
          />
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
            className="w-5 h-5 border-gray-300 rounded text-black focus:ring-black accent-black"
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
          className={`w-full bg-black text-white rounded-lg py-3 ${typography.buttonSmall} hover:bg-gray-800 transition-colors`}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </AuthLayout>
  );
}

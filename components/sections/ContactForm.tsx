"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import { useState } from "react";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert([
        {
          full_name: data.fullName,
          email: data.email,
          message: data.message,
        },
      ]);

      if (error) throw error;

      toast.success("Message sent successfully!");
      reset();
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full lg:w-1/2 my-2">
      <div className="flex flex-col gap-2 mb-3">
        <label className="uppercase text-xs md:text-sm text-gray-500 font-semibold">
          Full Name
        </label>
        <input
          {...register("fullName")}
          type="text"
          placeholder="Your Name"
          className={`border rounded-md px-4 py-2 sm:py-3 outline-none text-sm md:text-base ${
            errors.fullName ? "border-red-500" : ""
          }`}
        />
        {errors.fullName && (
          <span className="text-red-500 text-xs">{errors.fullName.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-3">
        <label className="uppercase text-xs md:text-sm text-gray-500 font-semibold">
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="Your Email"
          className={`border rounded-md px-4 py-2 sm:py-3 outline-none text-sm md:text-base ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="uppercase text-xs md:text-sm text-gray-500 font-semibold">
          Message
        </label>
        <textarea
          {...register("message")}
          placeholder="Your message"
          className={`border rounded-md h-35 px-4 py-2 sm:py-3 outline-none text-sm md:text-base resize-none ${
            errors.message ? "border-red-500" : ""
          }`}
        />
        {errors.message && (
          <span className="text-red-500 text-xs">{errors.message.message}</span>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-47.25 mt-6 transition-all duration-300 py-2 md:py-3 rounded-lg bg-black flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-800 hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        <h2 className="text-white font-medium text-sm md:text-base">
          {isSubmitting ? "Sending..." : "Send Message"}
        </h2>
      </button>
    </form>
  );
};

export default ContactForm;

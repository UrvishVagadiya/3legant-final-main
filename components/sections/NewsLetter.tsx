"use client";

import Image from "next/image";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          toast.success("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Thank you for subscribing!");
        setEmail("");
      }
    } catch (err: unknown) {
      console.error("Newsletter error:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newsletter-section bg-[#F3F5F7] relative h-auto py-16 md:py-0 md:h-90 w-full overflow-hidden">
      <div className="newsletter-images hidden md:block">
        <Image
          style={{ mixBlendMode: "multiply" }}
          className="absolute -top-35 -left-65"
          src="/cupboard.jpg"
          width={690}
          height={380}
          alt="Newsletter"
        />
        <Image
          style={{ mixBlendMode: "multiply" }}
          className="absolute -top-20 -right-115"
          src="/chair.jpg"
          width={890}
          height={380}
          alt="Newsletter"
        />
      </div>

      <div className="newsletter-content flex flex-col items-center justify-center gap-8 md:gap-10 h-full relative text-center px-5 md:px-0">
        <div className="flex flex-col gap-2 md:gap-0 max-w-sm md:max-w-none mx-auto">
          <h1 className="text-center text-3xl md:text-3xl lg:text-4xl font-medium md:mb-2 text-[#141718]">
            Join Our Newsletter
          </h1>
          <h3 className="text-sm md:text-lg text-[#141718] font-normal">
            Sign up for deals, new products and promotions
          </h3>
        </div>

        <form
          onSubmit={handleSignup}
          className="newsletter-form flex w-full md:w-[60%] lg:w-[40%] xl:w-[30%] items-center justify-between pb-2 border-b border-gray-400 gap-3"
        >
          <div className="flex items-center gap-3 w-full">
            <MdOutlineMail className="text-2xl text-[#141718]" />
            <input
              className="bg-transparent outline-none w-full text-base placeholder:text-[#6C7275] text-[#141718]"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="text-[#6C7275] hover:text-[#141718] transition-colors font-medium cursor-pointer pl-4 duration-300 ease-in-out disabled:opacity-50"
          >
            {isLoading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsLetter;

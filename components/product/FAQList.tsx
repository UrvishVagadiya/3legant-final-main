"use client";
import { useState } from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

const faqs = [
  {
    question: "What materials is this product made of?",
    answer:
      "Our products are crafted from premium quality materials including solid wood, high-grade metal hardware, and durable upholstery fabrics. Each item undergoes strict quality checks before shipping.",
  },
  {
    question: "What is the estimated delivery time?",
    answer:
      "Standard delivery takes 5-7 business days. Express shipping is available at checkout and typically arrives within 2-3 business days. Free shipping orders are delivered within 7-10 business days.",
  },
  {
    question: "Can I return or exchange this product?",
    answer:
      "Yes, we offer a 30-day return and exchange policy. The product must be unused and in its original packaging. Contact our support team to initiate a return or exchange.",
  },
  {
    question: "Does this product come with a warranty?",
    answer:
      "All our products come with a 1-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available at the time of purchase.",
  },
  {
    question: "Is assembly required for this product?",
    answer:
      "Some products require minimal assembly. Detailed assembly instructions and all necessary hardware are included in the package. Video guides are also available on our website.",
  },
];

export default function FAQList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[15px] font-semibold text-[#141718]">
        Frequently Asked Questions
      </h4>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-[#E8ECEF] rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex justify-between items-center px-4 py-3 text-left cursor-pointer hover:bg-[#F3F5F7] transition-colors"
          >
            <span className="text-[14px] font-medium text-[#141718]">
              {faq.question}
            </span>
            {openIndex === i ? (
              <MdOutlineKeyboardArrowUp className="text-xl text-[#6C7275] shrink-0" />
            ) : (
              <MdOutlineKeyboardArrowDown className="text-xl text-[#6C7275] shrink-0" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-40 px-4 pb-3" : "max-h-0"}`}
          >
            <p className="text-[13px] text-[#6C7275] leading-5.5">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

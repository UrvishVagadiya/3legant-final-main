"use client";
import { useEffect, useState } from "react";
import { typography } from "@/constants/typography";

const TimeRenderer = ({ time, title }: { time: string; title: string }) => (
  <div className="flex flex-col items-center">
    <span
      className={`${typography.h5} bg-[#F3F5F7] h-15 w-15 flex items-center justify-center`}
    >
      {time}
    </span>
    <span className={`${typography.text12} pt-2 text-[#6C7275]`}>{title}</span>
  </div>
);

export default function CountdownTimer({
  validUntil,
}: {
  validUntil?: string | number;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const getTarget = () => {
      if (!validUntil)
        return Date.now() + 2 * 86400000 + 12 * 3600000 + 45 * 60000;
      if (typeof validUntil === "number")
        return validUntil < 10000000000 ? validUntil * 1000 : validUntil;
      return new Date(validUntil).getTime();
    };
    const target = getTarget();
    const interval = setInterval(() => {
      const d = target - Date.now();
      if (d <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d / 3600000) % 24),
        minutes: Math.floor((d / 60000) % 60),
        seconds: Math.floor((d / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [validUntil]);

  const entries = [
    { val: timeLeft.days, label: "Days" },
    { val: timeLeft.hours, label: "Hours" },
    { val: timeLeft.minutes, label: "Minutes" },
    { val: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="border-b border-[#E8ECEF] pb-6 mt-2">
      <p className={`${typography.text16} text-[#141718] mb-4`}>
        Offer expires in:
      </p>
      <div className="flex gap-4">
        {entries.map((e) => (
          <TimeRenderer
            key={e.label}
            time={String(e.val).padStart(2, "0")}
            title={e.label}
          />
        ))}
      </div>
    </div>
  );
}

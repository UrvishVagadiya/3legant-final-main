"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, User, Clock, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch messages");
      console.error(error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete message");
    } else {
      toast.success("Message deleted");
      setSubmissions(submissions.filter((s) => s.id !== id));
    }
  };

  if (loading) {
    return <div className="text-[#6C7275]">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#141718]">Customer Messages</h1>
        <p className="text-sm text-[#6C7275]">{submissions.length} Total Messages</p>
      </div>

      <div className="grid gap-6">
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No messages found.</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#141718] font-semibold">
                      <User size={16} className="text-gray-400" />
                      {submission.full_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6C7275]">
                      <Mail size={14} className="text-gray-400" />
                      {submission.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                      <Clock size={12} />
                      {new Date(submission.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    title="Delete Message"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-[#141718] leading-relaxed whitespace-pre-wrap">
                  {submission.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useUpdateProfileMutation } from "@/store/api/authApi";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Tab = "account" | "address" | "orders" | "wishlist";

interface AccountSidebarProps {
  fullName: string;
  displayName: string;
  avatarUrl: string | null;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAvatarChange: (url: string) => void;
}

const tabs: { value: Tab; label: string }[] = [
  { value: "account", label: "Account" },
  { value: "address", label: "Address" },
  { value: "orders", label: "Orders" },
  { value: "wishlist", label: "Wishlist" },
];

const AccountSidebar = ({
  fullName,
  displayName,
  avatarUrl,
  activeTab,
  onTabChange,
  onAvatarChange,
}: AccountSidebarProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const [updateProfile] = useUpdateProfileMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: urlData.publicUrl }).unwrap();

      onAvatarChange(urlData.publicUrl);
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(
        `Error uploading image: ${message || 'Unknown error. Please ensure you have an "avatars" bucket created.'}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoutConfirmed = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const getTabClass = (tab: Tab) =>
    activeTab === tab
      ? "text-gray-900 border-b-[1.5px] border-black font-semibold pb-1 cursor-pointer w-full pr-8"
      : "text-gray-500 hover:text-gray-900 font-semibold cursor-pointer transition-colors";

  return (
    <div className="w-full md:w-1/3 lg:w-65 bg-[#F3F5F7] p-6 rounded-xl h-fit shrink-0">
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden mb-2 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-500">
                {fullName ? fullName.charAt(0).toUpperCase() : "S"}
              </span>
            )}
          </div>
          <div
            className="absolute bottom-2 -right-1 bg-black text-white p-1.5 rounded-full cursor-pointer border-2 border-white hover:bg-gray-800 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="w-3 h-3 rounded-full border-2 border-t-white border-transparent animate-spin" />
            ) : (
              <FaPencil className="w-3 h-3" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <h1 className="capitalize text-[20px] font-semibold mt-1 text-center">
          {displayName || fullName || "Sofia Havertz"}
        </h1>
      </div>

      <div className="md:hidden mb-4">
        <select
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none font-semibold text-gray-900 bg-white shadow-sm"
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as Tab)}
        >
          {tabs.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:flex flex-col gap-6 text-[16px]">
        {tabs.map((t) => (
          <h2
            key={t.value}
            className={getTabClass(t.value)}
            onClick={() => onTabChange(t.value)}
          >
            {t.label}
          </h2>
        ))}
        <h2
          className="text-gray-500 hover:text-gray-900 font-semibold cursor-pointer transition-colors pt-2"
          onClick={handleLogout}
        >
          Log Out
        </h2>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        isLoading={isLoggingOut}
        onConfirm={handleLogoutConfirmed}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default AccountSidebar;
export type { Tab };

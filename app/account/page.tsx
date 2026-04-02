"use client";
import { useForm } from "react-hook-form";
import { createClient } from "../../utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AccountDetails from "../../components/account/AccountDetails";
import Address from "../../components/account/Address";
import OrdersHistory from "../../components/account/OrdersHistory";
import Wishlist from "../../components/account/Wishlist";
import AccountSidebar, { Tab } from "../../components/account/AccountSidebar";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  oldPassword: string;
  newPassword: string;
  repeatNewPassword: string;
};

import { useAppDispatch, useAppSelector, RootState } from "@/store";

const AccountContent = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab && ["account", "address", "orders", "wishlist"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
  } = useForm<FormData>();

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.name || user.user_metadata?.full_name || "";
      const userDisplayName =
        user.user_metadata?.displayName || user.user_metadata?.username || "";
      setFullName(name);
      setDisplayName(userDisplayName);
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setValue("email", user.email || "");
      setValue("displayName", userDisplayName);
      const [firstName, lastName] = name.split(" ");
      setValue("firstName", firstName || "");
      setValue("lastName", lastName || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    if (data.newPassword !== data.repeatNewPassword) return;
    if (data.oldPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email || "",
        password: data.oldPassword,
      });
      if (signInError) {
        setError("oldPassword", {
          type: "manual",
          message: "Incorrect old password",
        });
        return;
      }
    }
    const { error } = await supabase.auth.updateUser({
      email: data.email,
      password: data.newPassword || undefined,
      data: {
        name: `${data.firstName} ${data.lastName}`,
        displayName: data.displayName,
      },
    });

    if (error) {
      setError("root", { type: "manual", message: error.message });
      return;
    }

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: `${data.firstName} ${data.lastName}`,
        display_name: data.displayName,
        email: data.email
      })
      .eq("id", user?.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    import("react-hot-toast").then((m) => {
      m.default.success("Profile updated successfully!");
    });
    
    setFullName(`${data.firstName} ${data.lastName}`);
    setDisplayName(data.displayName || "");
    router.refresh();
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="w-full px-5 md:px-10 lg:px-40 py-10 md:py-20">
      <h1 className="text-center text-4xl md:text-[54px] font-medium mb-10 md:mb-20">
        My Account
      </h1>

      <div className="flex flex-col md:flex-row gap-8 md:gap-18 mb-22">
        <AccountSidebar
          fullName={fullName}
          displayName={displayName}
          avatarUrl={avatarUrl}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAvatarChange={setAvatarUrl}
        />

        <div className="flex-1 w-full">
          {activeTab === "account" && (
            <AccountDetails
              register={register}
              errors={errors}
              watch={watch}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
            />
          )}
          {activeTab === "address" && <Address fullName={fullName} />}
          {activeTab === "orders" && <OrdersHistory />}
          {activeTab === "wishlist" && <Wishlist />}
        </div>
      </div>
    </div>
  );
};

import AccountLoading from "./loading";

const Account = () => (
  <Suspense fallback={<AccountLoading />}>
    <AccountContent />
  </Suspense>
);

export default Account;

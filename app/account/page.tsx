"use client";
import { useForm } from "react-hook-form";
import { createClient } from "../../utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

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

import { useAppSelector, RootState } from "@/store";

const AccountContent = () => {
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
    clearErrors,
  } = useForm<FormData>();

  useEffect(() => {
    if (user) {
      const name =
        user.user_metadata?.name || user.user_metadata?.full_name || "";
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
    clearErrors("root");

    const isChangingPassword = Boolean(
      data.oldPassword || data.newPassword || data.repeatNewPassword,
    );

    let hasPasswordError = false;

    if (isChangingPassword) {
      clearErrors(["oldPassword", "newPassword", "repeatNewPassword"]);

      if (!data.oldPassword) {
        setError(
          "oldPassword",
          {
            type: "manual",
            message: "Old password is required to set a new password",
          },
          { shouldFocus: true },
        );
        hasPasswordError = true;
      }

      if (!data.newPassword) {
        setError(
          "newPassword",
          {
            type: "manual",
            message: "New password is required if old password is provided",
          },
          { shouldFocus: true },
        );
        hasPasswordError = true;
      }

      if (!data.repeatNewPassword) {
        setError(
          "repeatNewPassword",
          {
            type: "manual",
            message: "Please repeat your new password",
          },
          { shouldFocus: true },
        );
        hasPasswordError = true;
      }

      if (
        data.oldPassword &&
        data.newPassword &&
        data.newPassword === data.oldPassword
      ) {
        setError(
          "newPassword",
          {
            type: "manual",
            message: "New password cannot be the same as the old password",
          },
          { shouldFocus: true },
        );
        hasPasswordError = true;
      }

      if (
        data.newPassword &&
        data.repeatNewPassword &&
        data.newPassword !== data.repeatNewPassword
      ) {
        setError(
          "repeatNewPassword",
          {
            type: "manual",
            message: "Passwords do not match",
          },
          { shouldFocus: true },
        );
        hasPasswordError = true;
      }
    }

    if (hasPasswordError) {
      return;
    }

    try {
      if (isChangingPassword && data.oldPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email || "",
          password: data.oldPassword,
        });

        if (signInError) {
          setError(
            "oldPassword",
            {
              type: "manual",
              message: "Incorrect old password",
            },
            { shouldFocus: true },
          );
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        email: data.email,
        password: isChangingPassword ? data.newPassword : undefined,
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
          email: data.email,
        })
        .eq("id", user?.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      import("react-hot-toast").then((m) => {
        m.default.success("Profile updated successfully!");
      });

      setValue("oldPassword", "");
      setValue("newPassword", "");
      setValue("repeatNewPassword", "");
      clearErrors(["oldPassword", "newPassword", "repeatNewPassword"]);

      setFullName(`${data.firstName} ${data.lastName}`);
      setDisplayName(data.displayName || "");
      router.refresh();
    } catch {
      setError("root", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-350 mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-12 pt-8 md:pt-14 lg:pt-20 pb-8 md:pb-14 lg:pb-16">
      <button
        type="button"
        onClick={handleBack}
        className="md:hidden inline-flex items-center gap-1 text-sm font-medium text-[#141718] mb-4"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <h1 className="text-center text-4xl md:text-[54px] font-medium mb-10 md:mb-20">
        My Account
      </h1>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6 md:gap-8 lg:gap-10 xl:gap-18 mb-16 md:mb-20">
        <AccountSidebar
          fullName={fullName}
          displayName={displayName}
          avatarUrl={avatarUrl}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAvatarChange={setAvatarUrl}
        />

        <div className="flex-1 w-full min-w-0">
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

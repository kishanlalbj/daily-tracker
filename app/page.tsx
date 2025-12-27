"use client";
import LoginForm from "@/components/login-form";
import type { LoginData } from "@/components/login-form";
import type { RegistrationData } from "@/components/registration-form";
import RegistrationForm from "@/components/registration-form";
import { paths } from "@/constants";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

const Page = () => {
  const [toggleForm, setToggleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleForm = () => setToggleForm((prev) => !prev);

  const handleLoginSubmit = async (data: LoginData) => {
    try {
      setLoading(true);

      const res = await fetch(`${paths.LOGIN_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Login failed", {
          richColors: true,
          position: "top-center"
        });
        return;
      }

      toast.success("Login successful", { richColors: true });

      // TODO: look for better approach to refresh after login
      router.refresh();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("An error occurred during login", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    try {
      console.log(data);
      setLoading(true);
      const res = await fetch(`${paths.REGISTER_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Registration failed", {
          richColors: true,
          position: "top-center"
        });
        return;
      }

      handleToggleForm();
      toast.success("Registration successful", { richColors: true });
      console.log(data);
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("An error occurred during registration", {
        richColors: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Daily Tracker App
      </h1>
      <div>
        {!toggleForm ? (
          <LoginForm
            onSubmit={handleLoginSubmit}
            onToggle={handleToggleForm}
            loading={loading}
          />
        ) : (
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            onToggle={handleToggleForm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Page;

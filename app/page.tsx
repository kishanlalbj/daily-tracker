"use client";

import LoginForm from "@/components/forms/login-form";
import type { LoginData } from "@/components/forms/login-form";
import type { RegistrationData } from "@/components/forms/registration-form";
import RegistrationForm from "@/components/forms/registration-form";
import { paths } from "@/constants";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  TrendingUpIcon,
  HeartPulseIcon,
  BrainCircuitIcon,
  RepeatIcon,
  BarChart3Icon,
  UploadIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Static data ────────────────────────────────────────────────────────── */
const mockStats = [
  { label: "Total Expenses", value: "₹18,340", delta: "+12%", trend: "up" },
  { label: "Savings", value: "₹4,200", delta: "this month", trend: "neutral" },
  { label: "BMI", value: "22.4", delta: "Normal", trend: "neutral" },
  { label: "Weight", value: "72 kg", delta: "-0.5 kg", trend: "down" }
];

const mockExpenses = [
  { label: "Groceries", cat: "Food", amount: "₹2,450" },
  { label: "Netflix", cat: "Entertainment", amount: "₹649" },
  { label: "Electricity", cat: "Utilities", amount: "₹1,200" },
  { label: "Gym", cat: "Health", amount: "₹800" }
];

const mockBars = [40, 65, 50, 88, 70, 45, 72];
const mockNavItems = ["Dashboard", "Health", "Expenses", "Profile"];

const features = [
  {
    icon: TrendingUpIcon,
    title: "Expense Tracking",
    description:
      "Log every purchase with categories, notes, and dates. Filter, sort, and search to understand exactly where your money goes each month."
  },
  {
    icon: HeartPulseIcon,
    title: "Health Monitoring",
    description:
      "Track weight, BMI, body fat percentage, and waist measurements. Visualise your progress over time with trend charts."
  },
  {
    icon: BrainCircuitIcon,
    title: "AI Categorization",
    description:
      "Upload a bank statement CSV and let AI tag every transaction automatically. Review, adjust, and import in seconds — not hours."
  },
  {
    icon: RepeatIcon,
    title: "Recurring Expenses",
    description:
      "Set up subscriptions and bills once. They log themselves on your chosen schedule — daily, weekly, monthly, or yearly."
  },
  {
    icon: BarChart3Icon,
    title: "Charts & Trends",
    description:
      "Bar charts for spending over time, pie charts for category breakdown, and line charts for health data — all in one dashboard."
  },
  {
    icon: UploadIcon,
    title: "Bank Import",
    description:
      "Import CSV exports from any bank. Preview, clean, and bulk-confirm transactions before they hit your records."
  }
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
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
        headers: { "Content-Type": "application/json" },
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
      router.refresh();
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during login", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    try {
      setLoading(true);
      const res = await fetch(`${paths.REGISTER_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (err) {
      toast.error("An error occurred during registration", {
        richColors: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogon = () => {
    window.location.href = "/api/auth/google";
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav
          className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Daily Tracker</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => scrollTo("features")}>
              Features
            </Button>
            <Button size="sm" onClick={() => scrollTo("auth")}>
              Sign in
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="hero-heading" className="relative overflow-hidden border-b border-border">
          {/* radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,oklch(0.67_0.21_145/0.1)_0%,transparent_100%)]"
          />

          <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-0 flex flex-col items-center text-center gap-7">
            <Badge variant="secondary" className="px-3 py-1 text-xs tracking-wide">
              Expenses &amp; Health — one place
            </Badge>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Your money. Your health.
              <br />
              <span className="text-primary">One smart dashboard.</span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
              A personal tracker for spending habits and body measurements. AI-assisted
              bank imports, trend charts, and recurring bill automation — all yours.
            </p>

            <div className="flex items-center gap-3">
              <Button size="lg" onClick={() => scrollTo("auth")}>
                Get started free
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("features")}>
                See features
              </Button>
            </div>

            {/* ── Dashboard mockup — bleeds off bottom ── */}
            <div className="w-full max-w-4xl mt-4 rounded-t-xl border border-b-0 border-border bg-card shadow-2xl overflow-hidden">

              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/55" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.68_0.16_70)]/55" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/55" />
                </div>
                <div className="flex-1 mx-6 h-5 rounded bg-background/60 border border-border flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">
                    daily-tracker.app/dashboard
                  </span>
                </div>
              </div>

              {/* App layout */}
              <div className="flex h-72 md:h-96" aria-hidden="true">

                {/* Sidebar */}
                <div className="hidden md:flex w-44 shrink-0 flex-col border-r border-border bg-sidebar p-3 gap-1">
                  <div className="flex items-center gap-2 px-2 py-2 mb-1">
                    <div className="h-5 w-5 shrink-0 rounded bg-primary flex items-center justify-center">
                      <TrendingUpIcon className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                    <span className="text-[11px] font-semibold text-sidebar-foreground truncate">
                      Daily Tracker
                    </span>
                  </div>
                  {mockNavItems.map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${
                        i === 0
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/60"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 p-4 bg-background/40">
                  {/* Page header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Dashboard</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/60 border border-border px-2 py-0.5 rounded">
                      Jan 2026
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {mockStats.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg border border-border bg-card p-2.5 flex flex-col gap-1"
                      >
                        <span className="text-[10px] text-muted-foreground truncate">
                          {s.label}
                        </span>
                        <span className="text-xs font-semibold font-mono tabular-nums">
                          {s.value}
                        </span>
                        <span
                          className={`text-[10px] font-mono flex items-center gap-0.5 ${
                            s.trend === "up"
                              ? "text-destructive"
                              : s.trend === "down"
                                ? "text-primary"
                                : "text-muted-foreground"
                          }`}
                        >
                          {s.trend === "up" && <ArrowUpIcon className="h-2.5 w-2.5" />}
                          {s.trend === "down" && <ArrowDownIcon className="h-2.5 w-2.5" />}
                          {s.delta}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart + table row */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
                    {/* Bar chart */}
                    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        Spending — last 7 months
                      </span>
                      <div className="flex-1 flex items-end gap-1">
                        {mockBars.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-primary/65"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent expenses */}
                    <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
                      <div className="px-3 py-1.5 border-b border-border bg-muted/40 shrink-0">
                        <span className="text-[10px] font-medium">Recent Expenses</span>
                      </div>
                      <div className="divide-y divide-border">
                        {mockExpenses.map((e) => (
                          <div
                            key={e.label}
                            className="flex items-center justify-between px-3 py-1.5"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] truncate max-w-16">
                                {e.label}
                              </span>
                              <span className="shrink-0 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                {e.cat}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono tabular-nums shrink-0">
                              {e.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────────── */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="border-b border-border"
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-24 flex flex-col gap-14">
            <div className="flex flex-col items-center text-center gap-3">
              <h2
                id="features-heading"
                className="text-2xl md:text-3xl font-bold tracking-tight"
              >
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                A focused toolset built for people who take their personal
                finances and health seriously.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group flex flex-col gap-4 rounded-xl border border-border p-6 hover:border-primary/40 transition-colors duration-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quote ────────────────────────────────────────────────────────────── */}
        <section aria-label="Quote" className="border-b border-border bg-muted/20">
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <blockquote className="flex flex-col gap-4">
              <p className="text-xl md:text-2xl font-semibold italic tracking-tight">
                &ldquo;What gets measured, gets managed.&rdquo;
              </p>
              <footer>
                <cite className="text-xs text-muted-foreground not-italic">
                  — Peter Drucker
                </cite>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ── Auth ─────────────────────────────────────────────────────────────── */}
        <section id="auth" aria-labelledby="auth-heading" className="py-24 px-4">
          <div className="max-w-sm mx-auto flex flex-col items-center gap-8">

            {/* heading */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <TrendingUpIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h2
                  id="auth-heading"
                  className="text-2xl font-bold tracking-tight"
                >
                  {toggleForm ? "Create an account" : "Start tracking today"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {toggleForm
                    ? "Fill in your details to get started"
                    : "Sign in to continue to your dashboard"}
                </p>
              </div>
            </div>

            {/* form */}
            <div className="w-full">
              {!toggleForm ? (
                <LoginForm
                  onSubmit={handleLoginSubmit}
                  onToggle={handleToggleForm}
                  onGoogleLogon={handleGoogleLogon}
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
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
              <TrendingUpIcon className="h-2.5 w-2.5" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold">Daily Tracker</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for personal use. Your data stays yours.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page;

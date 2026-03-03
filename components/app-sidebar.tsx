"use client";
import {
  GaugeIcon,
  HeartPulseIcon,
  IndianRupeeIcon,
  LogOutIcon,
  MoonIcon,
  RepeatIcon,
  SunIcon,
  TrendingUpIcon,
  UserIcon,
  WalletIcon
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { paths } from "@/constants";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const navGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: GaugeIcon }]
  },
  {
    label: "Health",
    items: [
      { title: "Health Tracker", url: "/health-tracker", icon: HeartPulseIcon }
    ]
  },
  {
    label: "Expenses",
    items: [
      {
        title: "Assets",
        url: "/assets",
        icon: WalletIcon
      },
      {
        title: "Expenses Tracker",
        url: "/expense-tracker",
        icon: IndianRupeeIcon
      },
      {
        title: "Recurring Expenses",
        url: "/expense-tracker/recurring",
        icon: RepeatIcon
      }
    ]
  },
  {
    label: "Account",
    items: [{ title: "Profile", url: "/profile", icon: UserIcon }]
  }
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, open, toggleSidebar } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const res = await fetch(paths.LOGOUT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      toast.success("Logout successful", { richColors: true });

      // TODO: this is workaround. Look for right approach
      router.refresh();
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed", { richColors: true });
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`flex ${
                open ? "h-9 w-9 rounded-lg" : "h-5 w-5 rounded-sm"
              } items-center justify-center  bg-primary text-primary-foreground shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={toggleSidebar}
            >
              <TrendingUpIcon className={`${open ? "h-5 w-5" : "h-3 w-3"}`} />
            </div>
            {open && (
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-base font-semibold leading-tight truncate">
                  Daily Tracker
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  Track your progress
                </p>
              </div>
            )}
          </div>
          {!isMobile && open && (
            <div className="shrink-0">
              <SidebarTrigger />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="py-1">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="text-sm text-sidebar-foreground/70 font-medium data-[active=true]:font-semibold data-[active=true]:text-sidebar-foreground"
                    >
                      <Link href={item.url}>
                        <item.icon scale={1.5} className="scale-120" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-2 flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={
            resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {resolvedTheme === "dark" ? (
            <SunIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {open && (resolvedTheme === "dark" ? "Light Mode" : "Dark Mode")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />{" "}
          {open && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

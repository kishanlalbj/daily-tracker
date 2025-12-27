"use client";
import {
  Calendar,
  GaugeIcon,
  HeartPulseIcon,
  IndianRupeeIcon,
  LogOutIcon,
  PlaySquareIcon,
  TrendingUpIcon,
  UserIcon
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { paths } from "@/constants";
import { Toaster, toast } from "sonner";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: GaugeIcon
  },
  {
    title: "Health Tracker",
    url: "/health-tracker",
    icon: HeartPulseIcon
  },
  {
    title: "Expenses Tracker",
    url: "/expense-tracker",
    icon: IndianRupeeIcon
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar
  },
  {
    title: "Reels",
    url: "/reels",
    icon: PlaySquareIcon
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon
  }
];

export function AppSidebar() {
  const router = useRouter();
  const { isMobile, open, toggleSidebar } = useSidebar();

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
      router.refresh();
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed", { richColors: true });
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <Toaster />
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={!open ? toggleSidebar : () => {}}
            >
              <TrendingUpIcon className="h-5 w-5" />
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
            <div className="flex-shrink-0">
              <SidebarTrigger />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon scale={1.5} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOutIcon /> {open && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

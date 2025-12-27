"use client";
import {
  Calendar,
  GaugeIcon,
  HeartPulseIcon,
  IndianRupeeIcon,
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
      <SidebarHeader className="mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <TrendingUpIcon />
          </Button>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="mb-2">
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

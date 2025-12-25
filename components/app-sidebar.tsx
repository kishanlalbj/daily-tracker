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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";

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
  return (
    <Sidebar variant="sidebar" collapsible="icon">
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
    </Sidebar>
  );
}

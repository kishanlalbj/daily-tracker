"use client";
import {
  ActivityIcon,
  ChevronRight,
  DropletIcon,
  GaugeIcon,
  HeartPulseIcon,
  IndianRupeeIcon,
  LandmarkIcon,
  LogOutIcon,
  MoonIcon,
  RepeatIcon,
  SunIcon,
  TrendingUpIcon,
  UserIcon,
  WalletIcon
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

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
      { title: "Health Tracker", url: "/health-tracker", icon: HeartPulseIcon },
      {
        title: "Blood Pressure Monitor",
        url: "/health-tracker/blood-pressure",
        icon: ActivityIcon
      },
      {
        title: "Blood Glucose Monitor",
        url: "/health-tracker/blood-glucose",
        icon: DropletIcon
      }
    ]
  },
  {
    label: "Income",
    items: [
      {
        title: "Income Tracker",
        url: "/income-tracker",
        icon: TrendingUpIcon
      },
      {
        title: "Recurring Income",
        url: "/income-tracker/recurring",
        icon: RepeatIcon
      }
    ]
  },
  {
    label: "Expenses",
    items: [
      {
        title: "Expenses Tracker",
        url: "/expense-tracker",
        icon: IndianRupeeIcon
      },
      {
        title: "Recurring Expenses",
        url: "/expense-tracker/recurring",
        icon: RepeatIcon
      },
      {
        title: "Assets & Liabilities",
        url: "/assets",
        icon: LandmarkIcon
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
        {navGroups.map((group) => {
          const isGroupActive = group.items.some(
            (item) =>
              pathname === item.url || pathname.startsWith(item.url + "/")
          );
          return (
            <SidebarGroup key={group.label}>
              <Collapsible
                defaultOpen={isGroupActive}
                // Force open in icon-only mode so icons remain accessible
                open={!open ? true : undefined}
                className="group/collapsible"
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center">
                    {group.label}
                    <ChevronRight
                      className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      aria-hidden="true"
                    />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
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
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-2 flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
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

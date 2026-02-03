"use client";

import type { User } from "@/types";
import { createContext, useContext, ReactNode } from "react";

const UserContext = createContext<User | null>(null);

export function UserProvider({
  children,
  user
}: {
  children: ReactNode;
  user: User | null;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  return context;
}

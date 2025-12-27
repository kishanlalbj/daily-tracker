"use client";

import { createContext, useContext, ReactNode } from "react";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string | null;
  created_at: Date;
} | null;

const UserContext = createContext<User>(null);

export function UserProvider({
  children,
  user
}: {
  children: ReactNode;
  user: User;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  return context;
}

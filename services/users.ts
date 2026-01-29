import prisma from "@/lib/prisma";
import { GENDER, Provider, User } from "@/types";

type UserFormInput = {
  first_name: string;
  last_name: string;
  email: string;
  height?: number;
  password?: string;
  gender?: GENDER;
  avatar?: string;
  created_at?: Date;
  last_login_at?: Date;
  provider: Provider;
  is_deleted?: boolean;
};

export const findUserById = async (userId: number) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        is_deleted: false
      }
    });
    return user;
  } catch (err) {
    throw err;
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        is_deleted: false
      }
    });

    return user;
  } catch (err) {
    throw err;
  }
};

export const createUser = async (data: UserFormInput) => {
  try {
    const user = await prisma.user.create({
      data
    });

    return user;
  } catch (err) {
    throw err;
  }
};

export const updateUser = async (userId: number, data: Partial<User>) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId, is_deleted: false },
      data
    });

    return user;
  } catch (err) {
    throw err;
  }
};

export const softDeleteUser = async (userId: number) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId, is_deleted: false },
      data: { is_deleted: true }
    });

    return user;
  } catch (error) {
    throw error;
  }
};

import { db } from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/auth/hash.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile> {
  const user = await db.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // If user wants to change password
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new BadRequestError(
        "Current password is required to set new password"
      );
    }

    if (user.provider !== "local") {
      throw new BadRequestError("Cannot change password for OAuth accounts");
    }

    if (!user.password) {
      throw new BadRequestError("No password set for this account");
    }

    const isValidPassword = await verifyPassword(
      data.currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new BadRequestError("Current password is incorrect");
    }

    const newPasswordHash = await hashPassword(data.newPassword);
    const updatedUser = await db.users.update({
      where: { id: userId },
      data: {
        name: data.name,
        password: newPasswordHash,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // If only updating name
  const updatedUser = await db.users.update({
    where: { id: userId },
    data: {
      name: data.name,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const user = await db.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Delete user (cascade will handle refresh_tokens)
  await db.users.delete({
    where: { id: userId },
  });
}

import { Doc, Id } from "../_generated/dataModel";

export type PublicUser = {
  _id: Id<"users">;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: Doc<"users">["role"];
  status: Doc<"users">["status"];
  phone?: string;
  bio?: string;
  imageUrl?: string;
  profileImageUrl?: string;
  mfaEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AdminUserListItem = PublicUser & {
  canManage: boolean;
};

export function toPublicUser(
  user: Doc<"users">,
  extras?: { profileImageUrl?: string }
): PublicUser {
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    role: user.role,
    status: user.status,
    phone: user.phone,
    bio: user.bio,
    imageUrl: user.imageUrl,
    profileImageUrl: extras?.profileImageUrl,
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toAdminUserListItem(
  user: Doc<"users">,
  canManage: boolean
): AdminUserListItem {
  return {
    ...toPublicUser(user),
    canManage,
  };
}

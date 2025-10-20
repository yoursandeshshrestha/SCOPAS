export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserProfileResponse {
  status: string;
  data: UserProfile;
}

export interface DeleteAccountResponse {
  status: string;
  message: string;
}

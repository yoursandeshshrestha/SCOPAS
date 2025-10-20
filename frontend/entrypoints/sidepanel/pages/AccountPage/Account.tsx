import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Save,
  Calendar,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { userService } from "../../services/user.service";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import type { UserProfile } from "../../types/user.types";

const Account: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getProfile();
      setProfile(response.data);
      setName(response.data.name || "");
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError(null);
      const response = await userService.updateProfile({ name });
      setProfile(response.data);
      setIsEditingProfile(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    try {
      setSavingPassword(true);
      setError(null);
      await userService.updateProfile({
        currentPassword,
        newPassword,
      });
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed successfully!");
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await userService.deleteAccount();
      dispatch(logout());
      navigate("/signin");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      {/* Opaque background under navbar + title */}
      <div className="fixed top-0 left-0 right-0 h-[9.5rem] bg-[var(--bg-dark)] z-30" />

      {/* Header bar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2">
            <User size={16} />
            Account Settings
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-2.5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-2.5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
                >
                  <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse mb-4" />
                  <div className="h-10 bg-neutral-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Profile Information */}
          {!loading && profile && (
            <div className="space-y-2.5">
              {/* Profile Section */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 transition-all duration-200 hover:border-neutral-600">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Information
                  </h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-neutral-400 text-xs mb-1">
                        Name
                      </label>
                      <p className="text-white text-sm">
                        {profile.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-neutral-400 text-xs mb-1">
                        Email
                      </label>
                      <p className="text-white text-sm">{profile.email}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input
                      type="text"
                      label="Name"
                      placeholder="Enter your name"
                      icon={User}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      label="Email"
                      value={profile.email}
                      disabled
                      icon={Mail}
                    />
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={savingProfile}
                        icon={<Save className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setName(profile.name || "");
                        }}
                        disabled={savingProfile}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Account Details */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 transition-all duration-200 hover:border-neutral-600">
                <h2 className="text-white font-semibold flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" />
                  Account Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-neutral-400 text-xs mb-1">
                        Authentication Provider
                      </label>
                      <p className="text-white text-sm capitalize">
                        {profile.provider}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Member Since
                      </div>
                      <p className="text-white text-sm">
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password Section - Only for local accounts */}
              {profile.provider === "local" && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 transition-all duration-200 hover:border-neutral-600">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </h2>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {!isChangingPassword ? (
                    <p className="text-neutral-400 text-sm">
                      Last updated: {formatDate(profile.updatedAt)}
                    </p>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <Input
                        type="password"
                        label="Current Password"
                        placeholder="Enter current password"
                        icon={Lock}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <Input
                        type="password"
                        label="New Password"
                        placeholder="Enter new password (min 8 characters)"
                        icon={Lock}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Input
                        type="password"
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={savingPassword}
                          icon={<Save className="w-4 h-4" />}
                        >
                          Update Password
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          disabled={savingPassword}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Danger Zone */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 transition-all duration-200">
                <h2 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Danger Zone
                </h2>
                <p className="text-neutral-400 text-sm mb-3">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText("");
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              <strong>Warning:</strong> This action cannot be undone. This will
              permanently delete your account and remove all your data from our
              servers.
            </p>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              Type <span className="font-semibold text-white">DELETE</span> to
              confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:border-red-500 transition-colors text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleDeleteAccount}
              isLoading={deleting}
              disabled={deleteConfirmText !== "DELETE"}
              icon={<Trash2 className="w-4 h-4" />}
              className="!bg-red-500 hover:!bg-red-600 !text-white"
            >
              Delete My Account
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Account;

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://route-posts.routemisr.com/users";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Photo states
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");

  // Password states
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Authentication
  function getAuthConfig() {
    return {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
  }

  // API error message
  function getErrorMessage(err: unknown, fallback: string) {
    const data = err.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }

    if (data?.errors) {
      return JSON.stringify(data.errors);
    }

    return fallback;
  }

  // Get profile data
  async function getUserData() {
    try {
      setLoading(true);
      setProfileError("");

      const { data } = await axios.get(
        `${API_URL}/profile-data`,
        getAuthConfig()
      );

      console.log("Profile API response:", data);

      const userData =
        data?.user ??
        data?.data?.user ??
        data?.data ??
        null;

      if (!userData || typeof userData !== "object") {
        setUser(null);
        setProfileError(
          "Could not identify user data in the API response."
        );
        return;
      }

      setUser(userData);
    } catch (err) {
      console.error(
        "Profile error:",
        err.response?.data || err.message
      );

      setProfileError(
        getErrorMessage(err, "Failed to load profile.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  // Select photo
  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];

    setPhotoError("");
    setPhotoMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhoto(null);
      setPhotoError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhoto(null);
      setPhotoError("Image size must be less than 5 MB.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // Upload profile photo
  async function handlePhotoUpload(e) {
    e.preventDefault();

    if (!photo) {
      setPhotoError("Please select an image first.");
      return;
    }

    try {
      setPhotoLoading(true);
      setPhotoError("");
      setPhotoMessage("");

      const formData = new FormData();
      formData.append("photo", photo);

      const { data } = await axios.put(
        `${API_URL}/upload-photo`,
        formData,
        getAuthConfig()
      );

      console.log("Upload photo response:", data);

      setPhotoMessage(
        data?.message || "Profile photo updated successfully."
      );

      setPhoto(null);
      setPhotoPreview("");

      await getUserData();
    } catch (err) {
      console.error(
        "Upload photo error:",
        err.response?.data || err.message
      );

      setPhotoError(
        getErrorMessage(err, "Failed to upload photo.")
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  // Change password
  async function handlePasswordChange(e) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    // Confirm password on the frontend only
    if (newPassword !== rePassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (password === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      // Do not send rePassword to the API
      const { data } = await axios.patch(
        `${API_URL}/change-password`,
        {
          password,
          newPassword,
        },
        getAuthConfig()
      );

      console.log("Change password response:", data);

      const newToken =
        data?.token ??
        data?.data?.token;

      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      setPassword("");
      setNewPassword("");
      setRePassword("");

      setPasswordMessage(
        data?.message || "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Change password error:",
        err.response?.data || err.message
      );

      setPasswordError(
        getErrorMessage(
          err,
          "Failed to change password. Please try again."
        )
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="font-medium text-slate-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Profile error screen
  if (profileError && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
            !
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-800">
            Unable to load profile
          </h2>

          <p className="mb-6 break-words text-sm text-red-600">
            {profileError}
          </p>

          <button
            onClick={getUserData}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // User data fields
  const displayName =
    user?.name ??
    user?.username ??
    user?.fullName ??
    "User";

  const email = user?.email ?? "No email available";
  const username = user?.username ?? "";

  const imageUrl =
    user?.photo ??
    user?.image ??
    user?.profilePhoto ??
    user?.photoUrl ??
    "";

  const displayedImage = photoPreview || imageUrl;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Account Settings
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Profile card */}
          <section className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-500" />

            <div className="-mt-14 px-6 pb-7 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-indigo-600">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="mt-4 wrap-break-word text-xl font-bold text-slate-900">
                {displayName}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {email}
              </p>

              {username && (
                <p className="mt-2 text-sm text-slate-400">
                  @{username}
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5 text-left">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Account
                    </p>
                    <p className="wrap-break-word text-sm font-semibold text-slate-700">
                      Personal Profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Settings */}
          <div className="space-y-6 lg:col-span-2">

            {/* Photo upload */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profile Photo
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a new image for your account.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePhotoUpload}>
                <label
                  htmlFor="profile-photo"
                  className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path d="M12 16V4m-5 5 5-5 5 5" />
                      <path d="M4 16v4h16v-4" />
                    </svg>
                  </div>

                  <span className="font-semibold text-slate-700">
                    {photo ? username : "Choose an image"}
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    PNG, JPG or WEBP · Maximum 5 MB
                  </span>

                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={handlePhotoSelect}
                  />
                </label>

                {photoError && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {photoError}
                  </p>
                )}

                {photoMessage && (
                  <p role="status" className="mt-3 text-sm text-emerald-600">
                    {photoMessage}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={photoLoading || !photo}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {photoLoading ? "Uploading..." : "Save Photo"}
                  </button>

                  {photo && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview("");
                        setPhotoError("");
                        setPhotoMessage("");
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Change password */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Change Password
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Use your current password to set a new one.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-5"
              >
                {/* Current password */}
                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Confirm new password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {passwordError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"
                  >
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    passwordLoading ||
                    !password ||
                    !newPassword ||
                    !rePassword
                  }
                  className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {passwordLoading
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
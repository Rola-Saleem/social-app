import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { authContext } from "../contexts/authContext";

export default function AuthLayout() {
  const { isLoading } = useContext(authContext);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:py-14">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

        {/* Top accent */}
        <div className="h-1.5 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-500" />

        <div className="p-6 sm:p-8">

          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-violet-200">
              <span className="text-3xl font-extrabold text-white">
                C
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              CIRCLE
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Connect, share, and stay close.
            </p>
          </div>

          {/* Sign In / Sign Up */}
          <div className="text-slate-800">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              Your community, your circle.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
import { useContext, useEffect, useState } from "react";

import {
  Navbar as HeroUiNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";

import { Link, useNavigate } from "react-router-dom";

import { counterContext } from "../contexts/counterContexts";
import { authContext } from "../contexts/authContext";

import { notificationsService } from "../services/notificationsService";

export default function Navbar() {
  const navigate = useNavigate();

  const { counter } = useContext(counterContext);

  const {
    isUserLogedIn,
    setIsUserLogedIn,
    userData,
  } = useContext(authContext);

  // =========================
  // User information
  // =========================

  const userName =
    userData?.name ??
    userData?.username ??
    userData?.fullName ??
    "User";

  const userEmail = userData?.email ?? "";

  const userImage =
    userData?.photo ??
    userData?.image ??
    userData?.profilePhoto ??
    userData?.photoUrl ??
    userData?.avatar ??
    "";

  // =========================
  // Notification states
  // =========================

  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState([]);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] = useState("");

  const [notificationActionId, setNotificationActionId] =
    useState(null);

  const [markAllLoading, setMarkAllLoading] = useState(false);

  // =========================
  // Logout
  // =========================

  function logout() {
    localStorage.removeItem("token");

    setIsUserLogedIn(false);
    setNotifications([]);
    setUnreadCount(0);
    setNotificationsOpen(false);

    navigate("/signin");
  }

  // =========================
  // Get unread count
  // =========================

  async function loadUnreadCount() {
    try {
      const data =
        await notificationsService.getUnreadCount();

      console.log("Unread count response:", data);

      const count =
        data?.unreadCount ??
        data?.data?.unreadCount ??
        data?.count ??
        data?.data?.count ??
        0;

      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error(
        "Unread count error:",
        error.response?.data || error.message
      );
    }
  }

  // =========================
  // Get notifications list
  // =========================

  async function loadNotifications() {
    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const data =
        await notificationsService.getNotifications(1, 10);

      console.log("Notifications response:", data);

      const list =
        data?.notifications ??
        data?.data?.notifications ??
        data?.data?.data ??
        data?.data ??
        [];

      if (Array.isArray(list)) {
        setNotifications(list);
      } else {
        setNotifications([]);
        setNotificationsError(
          "Unexpected notifications response format."
        );
      }
    } catch (error) {
      console.error(
        "Notifications error:",
        error.response?.data || error.message
      );

      setNotificationsError(
        error.response?.data?.message ??
          "Failed to load notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  // =========================
  // Load count after login
  // =========================

  useEffect(() => {
    if (!isUserLogedIn) {
      setUnreadCount(0);
      setNotifications([]);
      setNotificationsOpen(false);
      return;
    }

    loadUnreadCount();
  }, [isUserLogedIn]);

  // =========================
  // Toggle notification menu
  // =========================

  async function toggleNotifications() {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }

    setNotificationsOpen(true);

    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  }

  // =========================
  // Mark one as read
  // =========================

  async function handleMarkAsRead(notificationId) {
    if (!notificationId) return;

    try {
      setNotificationActionId(notificationId);

      await notificationsService.markAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) => {
          const id = notification._id ?? notification.id;

          if (id !== notificationId) {
            return notification;
          }

          return {
            ...notification,
            isRead: true,
            read: true,
          };
        })
      );

      await loadUnreadCount();
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error.response?.data || error.message
      );

      setNotificationsError(
        error.response?.data?.message ??
          "Failed to mark notification as read."
      );
    } finally {
      setNotificationActionId(null);
    }
  }

  // =========================
  // Mark all as read
  // =========================

  async function handleMarkAllAsRead() {
    if (unreadCount === 0 || markAllLoading) return;

    try {
      setMarkAllLoading(true);

      await notificationsService.markAllAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all as read error:",
        error.response?.data || error.message
      );

      setNotificationsError(
        error.response?.data?.message ??
          "Failed to mark all notifications as read."
      );
    } finally {
      setMarkAllLoading(false);
    }
  }

  // =========================
  // Render
  // =========================

  return (
    <HeroUiNavbar isBordered maxWidth="xl">

      {/* Logo */}

      <NavbarBrand>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-wide text-primary">
            CIRCLE
          </span>

          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
            {counter}
          </span>
        </Link>
      </NavbarBrand>

      <NavbarContent as="div" justify="end">

        {isUserLogedIn ? (
          <>
            {/* =========================
                Notifications
            ========================= */}

            <div className="relative">

              {/* Notification bell */}

              <button
                type="button"
                onClick={toggleNotifications}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-default-100 text-default-700 transition hover:bg-default-200"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}

              {notificationsOpen && (
                <div className="absolute right-0 top-14 z-[100] w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl sm:w-96">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                      <h3 className="text-base font-bold">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {unreadCount} unread notifications
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={
                        unreadCount === 0 || markAllLoading
                      }
                      className="rounded-lg px-2 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {markAllLoading
                        ? "Updating..."
                        : "Read all"}
                    </button>
                  </div>

                  {/* Notifications list */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {notificationsLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                        <p className="text-sm text-slate-500">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notificationsError &&
                      notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-red-600">
                          {notificationsError}
                        </p>

                        <button
                          type="button"
                          onClick={loadNotifications}
                          className="mt-3 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-5 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-7 w-7"
                            aria-hidden="true"
                          >
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                            <path d="M10 21h4" />
                          </svg>
                        </div>

                        <p className="font-semibold text-slate-700">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          You are all caught up!
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification, index) => {
                          const notificationId =
                            notification._id ??
                            notification.id;

                          const isRead =
                            notification.isRead ??
                            notification.read ??
                            false;

                          const message =
                            notification.message ??
                            notification.text ??
                            notification.title ??
                            "New notification";

                          return (
                            <div
                              key={notificationId ?? index}
                              className={`flex items-start gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
                                isRead
                                  ? "bg-white"
                                  : "bg-indigo-50/70"
                              }`}
                            >
                              {/* Icon */}

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                >
                                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                  <path d="M10 21h4" />
                                </svg>
                              </div>

                              {/* Content */}

                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-medium leading-5">
                                  {message}
                                </p>

                                {notification.createdAt && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleString()}
                                  </p>
                                )}

                                {!isRead && notificationId && (
                                  <button
                                    type="button"
                                    disabled={
                                      notificationActionId ===
                                      notificationId
                                    }
                                    onClick={() =>
                                      handleMarkAsRead(
                                        notificationId
                                      )
                                    }
                                    className="mt-2 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                                  >
                                    {notificationActionId ===
                                    notificationId
                                      ? "Updating..."
                                      : "Mark as read"}
                                  </button>
                                )}
                              </div>

                              {/* Unread indicator */}

                              {!isRead && (
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                              )}
                            </div>
                          );
                        }
                      )
                    )}
                  </div>

                  {/* Footer */}

                  <div className="border-t border-slate-100 p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                      className="w-full rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =========================
                User profile dropdown
            ========================= */}

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 transition hover:bg-default-100"
                  aria-label="Open user menu"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-foreground">
                      {userName}
                    </p>

                    <p className="max-w-40 truncate text-xs text-default-500">
                      {userEmail}
                    </p>
                  </div>

                  <Avatar
                    isBordered
                    color="secondary"
                    name={userName}
                    src={userImage || undefined}
                    size="md"
                    className="shrink-0"
                  />
                </button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Profile Actions"
                variant="flat"
              >
                <DropdownItem
                  key="user-info"
                  textValue="User information"
                  isReadOnly
                  className="h-14"
                >
                  <p className="text-sm font-semibold">
                    {userName}
                  </p>

                  <p className="text-xs text-default-500">
                    {userEmail}
                  </p>
                </DropdownItem>

                <DropdownItem
                  key="profile"
                  textValue="My Profile"
                  onPress={() => navigate("/profile")}
                >
                  My Profile
                </DropdownItem>

                <DropdownItem
                  key="home"
                  textValue="Home"
                  onPress={() => navigate("/")}
                >
                  Home
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  textValue="Log Out"
                  color="danger"
                  onPress={logout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link
                to="/signin"
                className="font-medium transition hover:text-primary"
              >
                Sign In
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link
                to="/signup"
                className="rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-80"
              >
                Sign Up
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </HeroUiNavbar>
  );
}
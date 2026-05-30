import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, CheckCircle2, Ticket, AlertCircle } from "lucide-react";

import {
  getNotifications,
  markAllAsRead as apiMarkAllAsRead,
  markAsRead,
  NotificationResponse,
} from "../../services/notificationService";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNotificationReceived = (notification: NotificationResponse) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  useWebSocket({ onNotificationReceived: handleNotificationReceived });

  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data.content);
      } catch (err) {
        // Silently fail if unauthenticated or error
      }
    };
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORGANIZER_APPROVED":
      case "EVENT_APPROVED":
      case "BOOKING_CONFIRMED":
      case "REFUND_PROCESSED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "DISPUTE_WARNING":
      case "EVENT_REJECTED":
      case "ORGANIZER_REJECTED":
      case "EVENT_CANCELLED":
      case "BOOKING_CANCELLED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "EVENT_POSTPONED":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Ticket className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : ""
                      }`}
                      onClick={(e) =>
                        !notification.read &&
                        handleMarkAsRead(notification.id, e)
                      }
                    >
                      <div className="shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${!notification.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="shrink-0 flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No new notifications</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/50">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

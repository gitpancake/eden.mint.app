"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotificationProps {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Notification({ type: _type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Simple white/black style to match app
  const baseCardClasses = "bg-white border border-black p-4 shadow-none";

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          ${baseCardClasses}
          max-w-md
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm font-bold text-black uppercase tracking-widest">{title}</div>
            <div className="font-mono text-xs text-black mt-1">{message}</div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-black hover:text-emerald-700 transition-colors ml-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Notification hook for easy usage
export function useNotification() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info" | "warning";
      title: string;
      message: string;
      duration?: number;
    }>
  >([]);

  const addNotification = (notification: Omit<(typeof notifications)[0], "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const NotificationContainer = () => (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );

  return {
    addNotification,
    NotificationContainer,
    notifications,
  };
}

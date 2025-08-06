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

export function Notification({ type, title, message, duration = 5000, onClose }: NotificationProps) {
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

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/30 text-green-400";
      case "error":
        return "bg-red-500/20 border-red-500/30 text-red-400";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
      case "info":
        return "bg-blue-500/20 border-blue-500/30 text-blue-400";
      default:
        return "bg-blue-500/20 border-blue-500/30 text-blue-400";
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          ${getColors()}
          backdrop-blur-sm rounded-lg p-4 border max-w-md shadow-lg
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="text-xl">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">{title}</div>
            <div className="text-sm text-gray-300 mt-1">{message}</div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            ✕
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

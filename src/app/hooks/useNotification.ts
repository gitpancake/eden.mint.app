import { useRef, useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  function showNotification(message: string) {
    setNotification(message);
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 4000);
  }

  return { notification, showNotification };
}

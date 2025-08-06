interface NotificationProps {
  message: string | null;
}

export function Notification({ message }: NotificationProps) {
  if (!message) return null;

  return <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-black px-6 py-2 font-mono text-xs uppercase tracking-widest text-black shadow-lg">{message}</div>;
}

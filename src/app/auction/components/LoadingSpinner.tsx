"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-white ${sizeClasses[size]}`} />
      {text && <div className="mt-2 text-gray-400 text-sm">{text}</div>}
    </div>
  );
}

export function LoadingCard({ title = "Loading...", className = "" }: { title?: string; className?: string }) {
  return (
    <div className={`bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-white mb-2">{title}</div>
          <div className="text-sm text-gray-400">Please wait while we load the data...</div>
        </div>
      </div>
    </div>
  );
}

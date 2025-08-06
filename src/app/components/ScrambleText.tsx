import { useEffect, useState } from "react";

const ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?/|";

function randomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ASCII[Math.floor(Math.random() * ASCII.length)];
  }
  return result;
}

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export function ScrambleText({ text, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(() => randomString(text.length));

  useEffect(() => {
    let mounted = true;
    let elapsed = 0;
    const duration = 250;
    const interval = 30;

    function animate() {
      if (!mounted) return;
      elapsed += interval;
      if (elapsed >= duration) {
        setDisplay(text);
        return;
      }
      setDisplay(randomString(text.length));
      setTimeout(animate, interval);
    }

    animate();
    return () => {
      mounted = false;
    };
  }, [text]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: `${text.length}ch`,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      {display}
    </span>
  );
}

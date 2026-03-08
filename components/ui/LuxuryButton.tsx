"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";

interface LuxuryButtonProps {
  variant?: "gold" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  playClick?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles = {
  gold: "bg-gold text-[#050505] font-semibold hover:bg-gold-light border border-gold/20",
  outline: "bg-transparent text-gold border border-gold/40 hover:border-gold hover:bg-gold/5",
  ghost: "bg-transparent text-[#9a9997] border border-[#2a2a2a] hover:border-[#1f1f1f] hover:text-[#E5E4E2]",
  danger: "bg-transparent text-[#e07b8a] border border-[#e07b8a]/30 hover:bg-[#5a1f2a]/40",
};

const sizeStyles = {
  sm: "px-4 py-2 text-xs tracking-widest",
  md: "px-6 py-3 text-sm tracking-widest",
  lg: "px-8 py-4 text-base tracking-widest",
};

export default function LuxuryButton({
  variant = "gold",
  size = "md",
  children,
  playClick = true,
  onClick,
  disabled,
  className = "",
  type = "button",
}: LuxuryButtonProps) {
  const { play } = useSound("/sounds/click.mp3", { volume: 0.3 });

  function handleClick() {
    if (disabled) return;
    if (playClick) play();
    onClick?.();
  }

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        rounded-sm uppercase font-sans transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

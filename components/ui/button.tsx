import React from "react";

type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "neon" 
  | "glass" 
  | "outline" 
  | "ghost" 
  | "social-white" 
  | "social-dark";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

export function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "", 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:pointer-events-none shrink-0";
  
  const variants = {
    primary: "bg-electric-blue text-white shadow-[0_4px_14px_0_rgba(0,86,212,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 hover:bg-[#0047b3] focus:ring-electric-blue",
    secondary: "bg-chalk-white text-obsidian-black shadow-[0_0_20px_rgba(250,250,250,0.3)] hover:scale-105 focus:ring-white",
    neon: "bg-neon-violet text-white shadow-[0_4px_20px_rgba(176,38,255,0.4)] hover:shadow-[0_6px_30px_rgba(176,38,255,0.6)] hover:bg-[#9a1ae6] hover:-translate-y-0.5 focus:ring-neon-violet",
    glass: "glass text-chalk-white hover:bg-chalk-white/10 focus:ring-white/50",
    outline: "border border-black/20 bg-white hover:bg-black/[0.02] text-obsidian-black focus:ring-black/10",
    ghost: "bg-transparent hover:bg-white/10 text-white focus:ring-white/20",
    "social-white": "border border-black/20 bg-white hover:bg-black/[0.02] text-obsidian-black shadow-sm",
    "social-dark": "border border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-3 text-sm rounded-xl",
    lg: "px-6 py-4 text-base rounded-2xl",
    icon: "p-3 rounded-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

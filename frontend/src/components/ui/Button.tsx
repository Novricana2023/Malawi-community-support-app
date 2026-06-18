import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-emerald-800 text-white hover:bg-emerald-900 shadow-lg shadow-emerald-900/20",
      secondary: "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/20",
      outline: "border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50",
      ghost: "text-emerald-800 hover:bg-emerald-50",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm font-medium",
      lg: "px-8 py-3.5 text-base font-semibold",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

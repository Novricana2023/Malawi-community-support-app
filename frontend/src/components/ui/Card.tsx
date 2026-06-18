import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-2", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>{children}</h3>;
}

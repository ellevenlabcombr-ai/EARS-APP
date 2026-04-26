import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-50 text-slate-900 hover:bg-slate-50/90":
              variant === "default",
            "bg-red-900 text-slate-50 hover:bg-red-900/90":
              variant === "destructive",
            "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white":
              variant === "outline",
            "bg-slate-800 text-slate-50 hover:bg-slate-800/80":
              variant === "secondary",
            "hover:bg-slate-800 text-slate-300 hover:text-white":
              variant === "ghost",
            "text-slate-50 underline-offset-4 hover:underline":
              variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };

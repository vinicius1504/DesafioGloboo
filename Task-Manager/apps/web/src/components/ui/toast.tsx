import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning"
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background border border-border",
      success: "bg-green-50 border border-green-200 text-green-800",
      error: "bg-red-50 border border-red-200 text-red-800",
      warning: "bg-yellow-50 border border-yellow-200 text-yellow-800"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
export default Toast
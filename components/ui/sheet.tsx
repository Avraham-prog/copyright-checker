"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 bg-black/40 z-50", className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

// הגדרה מותאמת עם side
interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "left" | "right";
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, side = "left", ...props }, ref) => {
  const sideClass =
    side === "left"
      ? "left-0 top-0 h-full w-64"
      : "right-0 top-0 h-full w-64";

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out",
          sideClass,
          className
        )}
        {...props}
      />
    </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
};

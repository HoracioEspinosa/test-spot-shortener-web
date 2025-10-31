import { cn } from "@/shared/utils/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";

export interface SideSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	side?: "left" | "right";
	className?: string;
	children: React.ReactNode;
	closeOnOutsideClick?: boolean;
	showCloseButton?: boolean;
	closeOnEscape?: boolean;
	scope?: "page" | "container"; // 'page' -> fixed to viewport, 'container' -> overlays its nearest positioned ancestor
}

export function SideSheet({
	open,
	onOpenChange,
	side = "left",
	className,
	children,
	closeOnOutsideClick = true,
	showCloseButton = true,
	closeOnEscape = true,
	scope = "page",
}: SideSheetProps) {
	// When scope === 'container', we render Content in-place (no Portal) and use absolute positioning
	const contentClasses = cn(
		scope === "page"
			? "fixed top-0 z-50 h-full w-full max-w-md"
			: "absolute top-0 z-40 h-full w-full max-w-md",
		"bg-white p-0 shadow-2xl flex flex-col",
		"data-[state=open]:animate-in data-[state=closed]:animate-out",
		"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
		side === "left"
			? scope === "page"
				? "left-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
				: "left-0"
			: scope === "page"
				? "right-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
				: "right-0",
		className,
	);
	const overlayClasses =
		scope === "page"
			? "fixed inset-0 z-40 bg-black/30"
			: "absolute inset-0 z-30 bg-black/20";

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{scope === "page" ? (
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay className={overlayClasses} />
					<DialogPrimitive.Content
						onInteractOutside={(e) => {
							if (!closeOnOutsideClick) e.preventDefault();
						}}
						onEscapeKeyDown={(e) => {
							if (!closeOnEscape) e.preventDefault();
						}}
						className={contentClasses}
					>
						{children}
						{showCloseButton && (
							<DialogPrimitive.Close className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
								<X className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</DialogPrimitive.Close>
						)}
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			) : (
				<>
					{/* In-place overlay/content; ensure parent has position: relative */}
					{open && (
						<>
							<div
								className={overlayClasses}
								role="button"
								tabIndex={0}
								onClick={() => {
									if (closeOnOutsideClick) onOpenChange(false);
								}}
								onKeyDown={(e) => {
									if (!closeOnOutsideClick) return;
									if (e.key === "Enter" || e.key === " ") onOpenChange(false);
								}}
							/>
							<DialogPrimitive.Content
								onInteractOutside={(e) => {
									if (!closeOnOutsideClick) e.preventDefault();
								}}
								onEscapeKeyDown={(e) => {
									if (!closeOnEscape) e.preventDefault();
								}}
								className={contentClasses}
							>
								{children}
								{showCloseButton && (
									<DialogPrimitive.Close className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
										<X className="h-4 w-4" />
										<span className="sr-only">Close</span>
									</DialogPrimitive.Close>
								)}
							</DialogPrimitive.Content>
						</>
					)}
				</>
			)}
		</DialogPrimitive.Root>
	);
}

export function SideSheetHeader({
	title,
	description,
}: { title: string; description?: string }) {
	return (
		<div className="sticky top-0 z-10 flex-shrink-0 border-b bg-white px-6 py-4">
			<DialogPrimitive.Title className="text-lg font-semibold text-gray-900">
				{title}
			</DialogPrimitive.Title>
			{description ? (
				<DialogPrimitive.Description className="text-sm text-gray-500 mt-1">
					{description}
				</DialogPrimitive.Description>
			) : null}
		</div>
	);
}

export function SideSheetBody({ children }: { children: React.ReactNode }) {
	return <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>;
}

export function SideSheetFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="sticky bottom-0 z-10 flex-shrink-0 border-t bg-white px-6 py-4 flex items-center justify-end gap-2">
			{children}
		</div>
	);
}

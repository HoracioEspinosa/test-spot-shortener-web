import {
	SideSheet,
	SideSheetBody,
	SideSheetFooter,
	SideSheetHeader,
} from "@/shared/components/SideSheet";
import type React from "react";
import { useMemo, useState } from "react";

/**
 * ResponsiveLayout
 * - Fixed header (top) and footer (bottom)
 * - Main container fills remaining vertical space (no global body scroll)
 * - Two sidebars (left/right) with full height of main container
 * - Desktop: both sidebars visible
 * - Mobile: only one sidebar visible, toggle between left/right
 * - Uses CSS variables for easy customization
 *   --header-height, --footer-height, --sidebar-width
 */
export interface ResponsiveLayoutProps {
	header?: React.ReactNode;
	footer?: React.ReactNode;
	leftSidebar?: React.ReactNode;
	rightSidebar?: React.ReactNode;
	content: React.ReactNode;
	showLeft?: boolean;
	showRight?: boolean;
	initialMobileSidebar?: "left" | "right";
	contentOnlyOnMobile?: boolean;
	className?: string;
	style?: React.CSSProperties;
	vars?: {
		headerHeight?: string;
		footerHeight?: string;
		sidebarWidth?: string;
	};
}

export function ResponsiveLayout({
	header,
	footer,
	leftSidebar,
	rightSidebar,
	content,
	showLeft = false,
	showRight = false,
	contentOnlyOnMobile = false,
	className,
	style,
	vars,
}: ResponsiveLayoutProps) {
	const [openCreate, setOpenCreate] = useState(false);
	const [openAnalytics, setOpenAnalytics] = useState(false);

	// CSS variables (overridable)
	const cssVars = useMemo((): React.CSSProperties => {
		const varsObj: Record<string, string> = {
			"--header-height": vars?.headerHeight ?? "clamp(56px, 7vh, 72px)",
			"--footer-height": vars?.footerHeight ?? "clamp(48px, 6vh, 64px)",
			"--sidebar-width": vars?.sidebarWidth ?? "clamp(220px, 22vw, 320px)",
		};
		return { ...(style || {}), ...varsObj };
	}, [style, vars?.footerHeight, vars?.headerHeight, vars?.sidebarWidth]);

	return (
		<div
			className={`rl__root${className ? ` ${className}` : ""}`}
			style={cssVars}
		>
			<style>{`
        /* Root takes full viewport and blocks body scroll */
        .rl__root {
          position: fixed;
          inset: 0;
          display: grid;
          grid-template-rows: var(--header-height) 1fr var(--footer-height);
          background: #f8fafc; /* subtle */
          color: #0f172a; /* slate-900 */
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }

        /* Header */
        .rl__header {
          position: sticky; /* within root row */
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: saturate(180%) blur(8px);
          border-bottom: 1px solid #e2e8f0; /* slate-200 */
        }

        .rl__title {
          margin: 0;
          font-size: clamp(16px, 2.2vh, 18px);
          font-weight: 700;
        }

        .rl__header-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rl__btn { 
          border: 1px solid #e2e8f0; 
          background: white; 
          border-radius: 8px; 
          padding: 6px 10px; 
          font-size: 14px; 
          cursor: pointer;
        }
        .rl__btn[aria-pressed="true"] {
          background: #0ea5e9; /* sky-500 */
          border-color: #0284c7; /* sky-600 */
          color: white;
        }

        /* Main: grid for sidebars + content */
        .rl__main {
          position: relative;
          overflow: hidden; /* prevent nested scroll bleed */
        }
        .rl__grid {
          height: 100%;
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
        }

        /* Columns scroll internally if needed */
        .rl__sidebar, .rl__content {
          min-height: 0; /* allow children to shrink */
          overflow: auto;
          background: white;
        }
        .rl__sidebar {
          border-right: 1px solid #e2e8f0;
        }
        .rl__sidebar--right {
          border-left: 1px solid #e2e8f0;
          border-right: none;
        }
        .rl__pane-header {
          position: sticky;
          top: 0;
          z-index: 1;
          padding: 12px 16px;
          background: rgba(255,255,255,0.95);
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
        }
        .rl__pane-body {
          padding: 12px 16px 16px;
        }

        /* Container overlay for SideSheet scope="container" */
        .rl__overlay-root {
          position: relative;
          height: 100%;
        }

        /* Footer */
        .rl__footer {
          position: sticky; /* within root row */
          bottom: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: saturate(180%) blur(8px);
          border-top: 1px solid #e2e8f0;
        }
        .rl__muted { color: #64748b; }

        /* Mobile behavior: only one sidebar visible; toggle decides which one */
        @media (max-width: 1023px) {
          .rl__grid {
            grid-template-columns: 1fr; /* single column */
          }
          .rl__sidebar--left, .rl__sidebar--right {
            display: none;
          }
          .rl__sidebar--left.is-active,
          .rl__sidebar--right.is-active {
            display: block;
          }
          .rl__content {
            display: none;
          }
          .rl__content.has-content-only { /* optional mode to show only content */
            display: block;
          }
        }
      `}</style>

			{/* Header (fixed within its grid row) */}
			<header className="rl__header">
				{header ?? (
					<>
						<h1 className="rl__title">Responsive Layout</h1>
						<div className="rl__header-controls">
							<span
								className="rl__muted"
								style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
							>
								Open overlay:
							</span>
							<button
								type="button"
								className="rl__btn"
								aria-pressed={openCreate}
								onClick={() => {
									setOpenCreate(true);
									setOpenAnalytics(false);
								}}
								title="Open create overlay"
							>
								Create
							</button>
							<button
								type="button"
								className="rl__btn"
								aria-pressed={openAnalytics}
								onClick={() => {
									setOpenAnalytics(true);
									setOpenCreate(false);
								}}
								title="Open analytics overlay"
							>
								Analytics
							</button>
							<button
								type="button"
								className="rl__btn"
								aria-pressed={!openCreate && !openAnalytics}
								onClick={() => {
									setOpenCreate(false);
									setOpenAnalytics(false);
								}}
								title="Close overlays"
							>
								Close
							</button>
						</div>
					</>
				)}
			</header>

			{/* Main */}
			<main className="rl__main">
				<div className="rl__grid">
					{/* Left Sidebar (optional, disabled by default in demo) */}
					{showLeft && (
						<aside
							className={"rl__sidebar rl__sidebar--left"}
							aria-label="Left sidebar"
						>
							{leftSidebar}
						</aside>
					)}

					{/* Content with container-scoped overlays */}
					<section
						className={`rl__content ${contentOnlyOnMobile ? "has-content-only" : ""}`}
						aria-label="Main content"
					>
						<div className="rl__overlay-root">
							{content ?? (
								<>
									<div className="rl__pane-header">Content</div>
									<div className="rl__pane-body">
										<p className="rl__muted">
											Only this area scrolls (and sidebars), never the body.
											Resize the window to see responsive behavior.
										</p>
										<div>
											{Array.from({ length: 50 }, (_, i) => `p-${i + 1}`).map(
												(id, idx) => (
													<p key={id}>
														Paragraph {idx + 1} — Lorem ipsum dolor sit amet,
														consectetur adipiscing elit.
													</p>
												),
											)}
										</div>
									</div>
								</>
							)}

							{/* Container-scoped demo sidebars, independent open states */}
							<SideSheet
								open={openCreate}
								onOpenChange={setOpenCreate}
								side="left"
								scope="container"
								closeOnOutsideClick={true}
								className="left-0 right-auto"
							>
								<SideSheetHeader title="Create" />
								<SideSheetBody>
									<p className="rl__muted">
										Demo left overlay (container-scoped). Opens only with Create
										button.
									</p>
								</SideSheetBody>
								<SideSheetFooter>
									<button
										type="button"
										className="rl__btn"
										onClick={() => setOpenCreate(false)}
									>
										Close
									</button>
								</SideSheetFooter>
							</SideSheet>

							<SideSheet
								open={openAnalytics}
								onOpenChange={setOpenAnalytics}
								side="right"
								scope="container"
								closeOnOutsideClick={true}
								className="right-0 left-auto"
							>
								<SideSheetHeader title="Analytics" />
								<SideSheetBody>
									<p className="rl__muted">
										Demo right overlay (container-scoped). Opens only with
										Analytics button.
									</p>
								</SideSheetBody>
								<SideSheetFooter>
									<button
										type="button"
										className="rl__btn"
										onClick={() => setOpenAnalytics(false)}
									>
										Close
									</button>
								</SideSheetFooter>
							</SideSheet>
						</div>
					</section>

					{/* Right Sidebar (optional, disabled by default in demo) */}
					{showRight && (
						<aside
							className={"rl__sidebar rl__sidebar--right"}
							aria-label="Right sidebar"
						>
							{rightSidebar}
						</aside>
					)}
				</div>
			</main>

			{/* Footer (fixed within its grid row) */}
			<footer className="rl__footer">
				{footer ?? (
					<>
						<span className="rl__muted">© 2025 Your Company</span>
						<div>
							<button type="button" className="rl__btn" title="Action 1">
								Action
							</button>
						</div>
					</>
				)}
			</footer>
		</div>
	);
}

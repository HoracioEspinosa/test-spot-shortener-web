import { Suspense } from "react";
import { LoadingFallback } from "./LoadingFallback";

export function PageWrapper({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

import { useState } from "react";
import { useToast } from "./use-toast";

export function useClipboard(timeout = 2000) {
	const [isCopied, setIsCopied] = useState(false);
	const { toast } = useToast();

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);

			toast({
				title: "Copied!",
				description: "Link copied to clipboard",
			});

			setTimeout(() => setIsCopied(false), timeout);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy to clipboard",
				variant: "destructive",
			});
		}
	};

	return { isCopied, copyToClipboard };
}

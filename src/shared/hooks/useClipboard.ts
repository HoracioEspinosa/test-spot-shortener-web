import { useState } from "react";
import { useToast } from "./use-toast";

export function useClipboard(timeout = 2000) {
	const [isCopied, setIsCopied] = useState(false);
	const { toast } = useToast();

	async function copyUsingClipboardAPI(text: string) {
		if (typeof navigator === "undefined" || !navigator.clipboard) return false;
		// Clipboard API generally requires a secure context (https or localhost)
		// Some browsers might still allow on insecure origins, but we guard regardless
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			return false;
		}
	}

	function copyUsingExecCommand(text: string) {
		try {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			// Avoid scrolling to bottom
			textarea.style.position = "fixed";
			textarea.style.left = "-9999px";
			textarea.setAttribute("readonly", "");
			document.body.appendChild(textarea);
			textarea.select();
			textarea.setSelectionRange(0, textarea.value.length);
			const ok = document.execCommand("copy");
			document.body.removeChild(textarea);
			return ok;
		} catch {
			return false;
		}
	}

	const copyToClipboard = async (text: string) => {
		const viaClipboard = await copyUsingClipboardAPI(text);
		const success = viaClipboard || copyUsingExecCommand(text);

		if (success) {
			setIsCopied(true);
			toast({ title: "Copied!", description: "Link copied to clipboard" });
			setTimeout(() => setIsCopied(false), timeout);
			return;
		}

		toast({
			title: "Error",
			description:
				"Failed to copy. Your browser may require HTTPS or permissions. Please copy manually.",
			variant: "destructive",
		});
	};

	return { isCopied, copyToClipboard };
}

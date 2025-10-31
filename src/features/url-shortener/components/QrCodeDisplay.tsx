import { fetchQrCodeBlob } from "@/api/qrcode";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

interface QrCodeDisplayProps {
	shortCode: string;
	isOpen: boolean;
	onClose: () => void;
}

export function QrCodeDisplay({
	shortCode,
	isOpen,
	onClose,
}: QrCodeDisplayProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const { toast } = useToast();

	// Generate QR code URL (used for consistent query params); actual fetching is authenticated
	// const qrCodeApiUrl = getQrCodeUrl(shortCode, { format: "png", size: 200 });

	// Load QR image as an authenticated blob (since endpoint is protected)
	const loadQrImage = useCallback(async () => {
		try {
			setIsLoading(true);
			const blob = await fetchQrCodeBlob(shortCode, {
				format: "png",
				size: 200,
			});
			const objectUrl = window.URL.createObjectURL(blob);
			setQrCodeUrl(objectUrl);
		} catch (e) {
			setQrCodeUrl(null);
			toast({
				title: "Error",
				description: "Failed to load QR code",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [shortCode, toast]);

	// Fetch on open using effect to avoid multiple triggers
	useEffect(() => {
		if (isOpen) {
			// reset and load
			setQrCodeUrl(null);
			loadQrImage();
		}
		// cleanup when closing handled in onOpenChange
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, loadQrImage]);

	const handleDownload = async () => {
		try {
			setIsLoading(true);
			const blob = await fetchQrCodeBlob(shortCode, {
				format: "png",
				size: 200,
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `qr-${shortCode}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast({
				title: "Success",
				description: "QR code downloaded successfully",
				variant: "default",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to download QR code. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					// Cleanup object URL to avoid memory leaks
					if (qrCodeUrl) {
						window.URL.revokeObjectURL(qrCodeUrl);
						setQrCodeUrl(null);
					}
					onClose();
				}
			}}
		>
			<DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg rounded-xl">
				<DialogHeader>
					<DialogTitle>QR Code</DialogTitle>
					<DialogDescription>
						Scan this QR code to access your shortened URL
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-4 py-4">
					{/* QR Code Image */}
					<div className="border rounded-lg p-4 bg-white">
						{qrCodeUrl ? (
							<img
								src={qrCodeUrl}
								alt={`QR code for ${shortCode}`}
								className="w-64 h-64"
							/>
						) : (
							<div className="w-64 h-64 flex items-center justify-center text-sm text-gray-500">
								{isLoading ? "Loading QR..." : "QR not available"}
							</div>
						)}
					</div>

					{/* Short Code Display */}
					<div className="text-center">
						<p className="text-sm text-gray-600">Short Code</p>
						<p className="font-mono font-semibold text-lg">{shortCode}</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 w-full">
						<Button
							onClick={handleDownload}
							disabled={isLoading}
							className="flex-1"
						>
							{isLoading ? "Downloading..." : "Download"}
						</Button>
						<Button variant="outline" onClick={onClose} className="flex-1">
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import { fetchQrCodeBlob } from "@/api/qrcode";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { useClipboard } from "@/shared/hooks/useClipboard";
import type { ShortenedUrl } from "@/shared/types/api.types";
import { formatDate, getRelativeTime } from "@/shared/utils/formatDate";
import { formatNumber } from "@/shared/utils/formatNumber";
import { BarChart3, Copy, ExternalLink, QrCode, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface UrlListItemProps {
	url: ShortenedUrl;
	onDelete: (id: string) => void;
	isDeleting?: boolean;
	onOpenAnalytics?: (shortCode: string) => void;
}

export function UrlListItem({
	url,
	onDelete,
	isDeleting = false,
	onOpenAnalytics,
}: UrlListItemProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [qrUrl, setQrUrl] = useState<string | null>(null);
	const [isLoadingQr, setIsLoadingQr] = useState(false);
	const { copyToClipboard } = useClipboard();

	// Display a clean short URL, but use /api/<code> for actual redirect to avoid SPA loop
	const shortUrlDisplay = `${window.location.origin}/${url.short_code}`;
	const shortUrlTarget = `${window.location.origin}/api/${url.short_code}`;

	const handleCopy = () => {
		// Copy the API endpoint for immediate redirect when pasted/opened
		copyToClipboard(shortUrlTarget);
	};

	const handleDelete = () => {
		onDelete(url.short_code);
		setShowDeleteDialog(false);
	};

	const isExpired = url.expires_at
		? new Date(url.expires_at) < new Date()
		: false;

	const revealQr = async () => {
		if (qrUrl || isLoadingQr) return;
		try {
			setIsLoadingQr(true);
			const blob = await fetchQrCodeBlob(url.short_code, {
				format: "png",
				size: 256,
			});
			const objectUrl = URL.createObjectURL(blob);
			setQrUrl(objectUrl);
		} finally {
			setIsLoadingQr(false);
		}
	};

	useEffect(() => {
		return () => {
			if (qrUrl) URL.revokeObjectURL(qrUrl);
		};
	}, [qrUrl]);

	return (
		<div className="w-full h-full rounded-xl border border-gray-200 bg-white flex flex-col overflow-hidden">
			{/* QR placeholder / image */}
			<button
				type="button"
				onClick={revealQr}
				className="relative aspect-square w-full bg-gray-50 flex items-center justify-center group"
				title={qrUrl ? "QR cargado" : "Click para revelar QR"}
			>
				{qrUrl ? (
					<img
						src={qrUrl}
						alt={`QR ${url.short_code}`}
						className="w-full h-full object-contain p-3"
					/>
				) : (
					<div className="flex flex-col items-center justify-center text-gray-500">
						<QrCode className="w-10 h-10 mb-2 opacity-70" />
						<span className="text-sm">
							{isLoadingQr ? "Cargando QR..." : "Mostrar QR"}
						</span>
					</div>
				)}
			</button>

			{/* Body */}
			<div className="flex-1 p-2.5 flex flex-col gap-1.5 min-h-[100px]">
				<div className="min-w-0">
					<div className="flex items-center gap-1.5 mb-1">
						<a
							href={shortUrlDisplay}
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-blue-600 hover:underline truncate"
						>
							{shortUrlDisplay}
						</a>
						{isExpired && (
							<span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
								Expired
							</span>
						)}
						{!url.is_active && (
							<span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
								Inactive
							</span>
						)}
					</div>
					<div className="flex items-center gap-1.5 text-xs text-gray-600">
						<ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
						<a
							href={url.original_url}
							target="_blank"
							rel="noopener noreferrer"
							className="truncate hover:underline"
							title={url.original_url}
						>
							{url.original_url}
						</a>
					</div>
				</div>

				<div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
					<div className="text-[11px] text-gray-500 flex flex-col leading-tight">
						<span title={formatDate(url.created_at)}>
							Created {getRelativeTime(url.created_at)}
						</span>
						<span>{formatNumber(url.click_count)} clicks</span>
					</div>
					<div className="flex items-center gap-1 w-full sm:w-auto justify-end">
						<Button
							variant="outline"
							size="xs"
							onClick={handleCopy}
							title="Copy"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="outline"
							size="xs"
							title="Analytics"
							onClick={() => onOpenAnalytics?.(url.short_code)}
						>
							<BarChart3 className="w-4 h-4" />
						</Button>
						<Button
							variant="outline"
							size="xs"
							onClick={() => setShowDeleteDialog(true)}
							disabled={isDeleting}
							title="Delete"
							className="text-red-600 hover:text-red-700 hover:bg-red-50"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Shortened URL</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this shortened URL? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm font-medium text-gray-900 mb-1">Short URL:</p>
						<p className="text-sm text-gray-600 break-all">{shortUrlDisplay}</p>
						<p className="text-sm font-medium text-gray-900 mt-3 mb-1">
							Original URL:
						</p>
						<p className="text-sm text-gray-600 break-all">
							{url.original_url}
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

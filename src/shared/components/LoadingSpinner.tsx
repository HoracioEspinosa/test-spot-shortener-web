export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
	return (
		<div className="flex items-center justify-center min-h-[30vh]">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
				<p className="text-gray-600">{label}</p>
			</div>
		</div>
	);
}

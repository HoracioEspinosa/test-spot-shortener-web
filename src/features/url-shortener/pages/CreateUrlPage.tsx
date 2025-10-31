import { CreateUrlForm } from "../components/CreateUrlForm";
import { useCreateUrl } from "../hooks/useCreateUrl";

export default function CreateUrlPage() {
	const { createUrl, isCreating, error, data } = useCreateUrl();

	return (
		<div className="max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Create Short URL</h1>
			<CreateUrlForm
				onSubmit={createUrl}
				isLoading={isCreating}
				error={error ?? null}
			/>
			{data && (
				<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
					<p className="text-sm text-green-700">
						Short URL created:{" "}
						<a
							className="underline"
							href={`${window.location.origin}/${data.short_code}`}
							target="_blank"
							rel="noreferrer"
						>{`${window.location.origin}/${data.short_code}`}</a>
					</p>
				</div>
			)}
		</div>
	);
}

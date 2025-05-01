export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function Field({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
	inputProps: React.InputHTMLAttributes<HTMLInputElement>;
	errors?: ListOfErrors;
	className?: string;
}) {
	return (
		<div className='flex flex-col gap-1'>
			<label {...labelProps} />
			<input
				{...inputProps}
				className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
			/>
			{errors ? (
				<ul className='text-red-500 flex flex-col gap-0.5'>
					{errors.map((error) => (
						<li key={error}>{error}</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

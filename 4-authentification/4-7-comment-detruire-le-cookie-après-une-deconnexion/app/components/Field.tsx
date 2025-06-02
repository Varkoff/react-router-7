import { ErrorList } from "./ErrorList";

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
			<label htmlFor={inputProps.id} {...labelProps} />
			<input
				{...inputProps}
				className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
			/>
				 <ErrorList  errors={errors} /> 
		</div>
	);
}

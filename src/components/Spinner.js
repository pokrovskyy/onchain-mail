import './Spinner.css'

const Spinner = () => {
	return (
		<div className="flex justify-center items-center">
			<div className="spinner-border animate-spin text-blue-600 inline-block w-8 h-8 border-4 rounded-full" role="status">
			</div>
		</div>
	)
}

export default Spinner
const EmptyPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"
            ></path>
        </svg>
        <p className="text-lg">No data available</p>
    </div>
  );
}
export default EmptyPlaceholder;
export function Button({ children, ...props }) {
    return (
        <button
            {...props}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
            {children}
        </button>
    );
}

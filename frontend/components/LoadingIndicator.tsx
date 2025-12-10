export default function LoadingIndicator() {
  return (
    <div className="px-4 py-3 border-t border-gray-3 bg-black-2 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-orange-2" />
      <span className="text-sm text-gray-9">AI is thinking...</span>
    </div>
  );
}


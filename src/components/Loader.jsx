const Loader = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="w-full h-64 bg-gray-300"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loader;


import { useVisitorCounter } from '../hooks/useVisitorCounter';

const VisitorCounter = () => {
  const { visitorCount, clickCount, isLoading, recentlyUpdated } = useVisitorCounter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-4 text-gray-400">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-xs md:text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-6 text-gray-300">
      {/* Visits Counter */}
      <div className={`flex items-center space-x-2 transition-all duration-300 ${
        recentlyUpdated ? 'scale-105 text-green-300' : ''
      }`}>
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-xs md:text-sm">
          <span className={`font-semibold transition-colors duration-300 ${
            recentlyUpdated ? 'text-green-300' : 'text-white'
          }`}>
            {visitorCount.toLocaleString()}
          </span> visits
        </span>
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
          recentlyUpdated ? 'bg-green-300 animate-bounce' : 'bg-green-400 animate-pulse'
        }`}></div>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-gray-600"></div>

      {/* Clicks Counter */}
      <div className="flex items-center space-x-2 text-gray-300">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-xs md:text-sm">
          <span className="text-white font-semibold">
            {clickCount.toLocaleString()}
          </span> clicks
        </span>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default VisitorCounter;
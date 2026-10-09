const SortDropdown = ({ value, onChange }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;


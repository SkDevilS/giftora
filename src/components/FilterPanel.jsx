import { useState } from 'react';

const FilterPanel = ({ filters, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const sizes = ['100g', '200g', '250g', '500g', '500ml', '1kg', '1L', '2kg', '5kg', '10kg', '2L'];
  const colors = []; // FMCG products typically don't have color variants

  const handleSizeToggle = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onFilterChange({ sizes: newSizes });
  };

  const handleColorToggle = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ colors: newColors });
  };

  const handlePriceChange = (e) => {
    const maxPrice = parseInt(e.target.value);
    setPriceRange([0, maxPrice]);
    onFilterChange({ maxPrice });
  };

  const handleStockToggle = (e) => {
    setInStockOnly(e.target.checked);
    onFilterChange({ inStockOnly: e.target.checked });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-4 md:mb-6">
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>₹0</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-4 md:mb-6">
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
          Sizes
        </label>
        <div className="space-y-1 md:space-y-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors - Only show if there are color options */}
      {colors.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors
          </label>
          <div className="space-y-2">
            {colors.map((color) => (
              <label key={color} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{color}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={handleStockToggle}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;


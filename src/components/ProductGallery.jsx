import { useState, useEffect } from 'react';

const ProductGallery = ({ images }) => {
  const imageArray = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800'];
  const [selectedImage, setSelectedImage] = useState(imageArray[0] || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800');
  
  useEffect(() => {
    if (imageArray.length > 0) {
      setSelectedImage(imageArray[0]);
    }
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={selectedImage || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800'}
          alt="Product"
          className="w-full h-full object-cover bg-gray-200"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800') {
              e.target.src = 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800';
            }
          }}
        />
      </div>
      {imageArray.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {imageArray.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === image
                  ? 'border-primary-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200'}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover bg-gray-200"
                loading="lazy"
                onError={(e) => {
                  if (e.target.src !== 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200') {
                    e.target.src = 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200';
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;


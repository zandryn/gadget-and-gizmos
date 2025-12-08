import React, { useState } from 'react';

const typeIcons = {
  computer: '💻',
  camera: '📷',
  appliance: '🏠',
  misc: '✨',
  miscellaneous: '✨',
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

function Device_Card({ device, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    nickname,
    model,
    brand,
    device_type,
    status,
    adopted_date,
    purchase_price,
    thumbnail,
    hover_photo,
    main_photo,
  } = device;

  // determine which images to show
  const primaryImage = thumbnail || main_photo;
  const secondaryImage = hover_photo;
  const hasImages = primaryImage || secondaryImage;
  const canSwap = primaryImage && secondaryImage;

  // current displayed image
  const currentImage = canSwap && isHovered ? secondaryImage : primaryImage;

  return (
    <article 
      className="device-card" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* image container - 1:1 aspect ratio */}
      <div className="device-card-image">
        {hasImages ? (
          <>
            <img 
              src={currentImage} 
              alt={nickname || model}
              className={`card-image ${canSwap ? 'can-swap' : ''}`}
            />
            {/* image indicators if has both images */}
            {canSwap && (
              <div className="image-indicators">
                <span className={`indicator ${!isHovered ? 'active' : ''}`}></span>
                <span className={`indicator ${isHovered ? 'active' : ''}`}></span>
              </div>
            )}
          </>
        ) : (
          <div className="placeholder">
            {typeIcons[device_type] || '📱'}
          </div>
        )}

        {/* status badge */}
        <span className={`status-badge ${status}`}>
          {status}
        </span>

        {/* type tag */}
        <span className="type-tag">
          {device_type}
        </span>
      </div>

      {/* card info */}
      <div className="device-card-info">
        <h3 className="device-card-name" title={nickname || model}>
          {nickname || model}
        </h3>
        <p className="device-card-brand">
          {brand} {nickname ? `· ${model}` : ''}
        </p>
        <div className="device-card-meta">
          <span>{formatDate(adopted_date)}</span>
          <span className="device-card-price">
            {formatPrice(purchase_price)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default Device_Card;

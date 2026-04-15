interface CountryFlagProps {
  country?: 'KR' | 'GB' | 'BN' | 'VN' | 'CN' | 'TH';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function CountryFlag({ country, size = 'md', className = '' }: CountryFlagProps) {
  const sizeMap = {
    sm: { width: 24, height: 16 },
    md: { width: 32, height: 24 },
    lg: { width: 48, height: 36 },
    xl: { width: 64, height: 48 },
  };

  const dimensions = sizeMap[size];

  if (!country) {
    return (
      <div
        className={`inline-block rounded bg-gray-200 ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w${dimensions.width * 2}/${country.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w${dimensions.width * 4}/${country.toLowerCase()}.png 2x`}
      alt={`${country} flag`}
      width={dimensions.width}
      height={dimensions.height}
      className={`inline-block rounded object-cover ${className}`}
      style={{ width: dimensions.width, height: dimensions.height, objectFit: 'cover' }}
    />
  );
}

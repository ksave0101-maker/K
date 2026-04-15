import Image from 'next/image';

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  rectangular?: boolean;
}

export default function CompanyLogo({ size = 'md', className = '', rectangular = false }: CompanyLogoProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
    '2xl': 100,
    '3xl': 140,
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
    '3xl': 'w-36 h-36',
  };

  if (rectangular) {
    const heights = {
      sm: 28,
      md: 40,
      lg: 52,
      xl: 64,
      '2xl': 80,
      '3xl': 100,
    };
    const widths = {
      sm: 80,
      md: 120,
      lg: 160,
      xl: 200,
      '2xl': 260,
      '3xl': 320,
    };
    return (
      <div className={`relative ${className}`} style={{ width: widths[size], height: heights[size] }}>
        <Image
          src="/kenergysave-logo.avif"
          alt="K Energy Save Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <Image
        src="/kenergysave-logo.avif"
        alt="K Energy Save Logo"
        width={sizeMap[size]}
        height={sizeMap[size]}
        className="object-contain"
        priority
      />
    </div>
  );
}

import Image from 'next/image';

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export default function CompanyLogo({ size = 'md', className = '' }: CompanyLogoProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
    '2xl': 100,
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
  };

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

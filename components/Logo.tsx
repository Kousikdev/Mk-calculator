import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'monochrome';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 32, variant = 'full' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background Shape */}
      <rect 
        x="10" 
        y="10" 
        width="80" 
        height="80" 
        rx="22" 
        fill={variant === 'full' ? 'url(#logoGradient)' : 'currentColor'} 
        className="transition-all duration-300"
      />
      
      {/* Hyper-N Paths */}
      <path 
        d="M30 70V30L55 55V30M70 30V70L45 45V70" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Nova Spark */}
      <circle cx="50" cy="50" r="4" fill="white" className="animate-pulse" />
    </svg>
  );
};

export default Logo;
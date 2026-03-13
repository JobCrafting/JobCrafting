import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", alt = "JobCrafting Logo" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
    >
      {/* Perimeter of the origami bird */}
      <path d="M4 9 L11 2 L21 4 L16 16 L12 21 L9 13 L4 9 Z" />
      
      {/* Internal Folds creating the 3D origami effect */}
      <path d="M11 2 L9 13" />   {/* Neck fold */}
      <path d="M21 4 L9 13" />   {/* Wing fold */}
      <path d="M16 16 L9 13" />  {/* Tail/Body fold */}
    </svg>
  );
};

export default Logo;
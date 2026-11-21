import React from 'react';
import { Sprout, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isLink?: boolean;
  to?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  isLink = true,
  to = '/',
  showTagline = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-md shadow-emerald-700/20 ${iconSizes[size]}`}>
        <Sprout className="w-5 h-5 text-emerald-100" />
        <div className="absolute -bottom-1 -right-1 bg-emerald-950 rounded-full p-0.5 border border-white">
          <Cpu className="w-2.5 h-2.5 text-emerald-400" />
        </div>
      </div>
      <div>
        <div className={`font-bold tracking-tight text-emerald-950 flex items-center gap-1 ${titleSizes[size]}`}>
          AgriSense <span className="text-emerald-600 font-extrabold">AI</span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium tracking-wide text-emerald-700/80 -mt-0.5">
            Smart Farming. Better Decisions.
          </p>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link to={to} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
};

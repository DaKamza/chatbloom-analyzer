
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full py-6 px-8 flex justify-between items-center", className)}>
      <div className="flex items-center">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-apple-blue to-apple-light-blue opacity-75 rounded-full blur"></div>
          <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-apple-blue"
            >
              <path 
                d="M8 9H16M8 13H14M11 17H8M20 7V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="ml-3">
          <h1 className="text-2xl font-semibold text-apple-black">WhatsApp Chat Analyzer</h1>
          <p className="text-apple-dark-gray text-sm">Unlock deep insights from your conversations</p>
        </div>
      </div>
    </header>
  );
};

export default Header;

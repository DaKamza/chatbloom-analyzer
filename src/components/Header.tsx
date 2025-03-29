
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, signOut, isPremium } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-apple-gray/30 backdrop-blur-lg">
      <div className="container flex h-[72px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-apple-blue" />
          <span className="font-medium">WhatsApp Analyzer</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isPremium && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full">
              Premium
            </span>
          )}
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-apple-dark-gray">
                {user.email?.split('@')[0]}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={signOut}
                className="text-apple-dark-gray"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              asChild
              className="text-apple-dark-gray"
            >
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-1" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeAlertsCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeAlertsCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* logo: marka */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-3xl font-bold tracking-tight hover:opacity-80 transition-opacity duration-300">
                hasHarita
              </h1>
            </Link>
          </div>

          {/* menü: desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:scale-105 text-lg font-medium px-6 py-3 transition-all duration-300 ease-in-out transform">
              <Link to="/about">Hakkımızda</Link>
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:scale-105 text-lg font-medium px-6 py-3 transition-all duration-300 ease-in-out transform">
              <Link to="/api">API</Link>
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:scale-105 text-lg font-medium px-6 py-3 transition-all duration-300 ease-in-out transform">
              <Link to="/documentation">Dökümantasyon</Link>
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:scale-105 text-lg font-medium px-6 py-3 transition-all duration-300 ease-in-out transform">
              <Link to="/contact">İletişim</Link>
            </Button>
            
            
          </nav>

          {/* menü: mobil */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/15 hover:scale-105 p-3 transition-all duration-300 ease-in-out transform"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* mobil menü */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 pt-6 border-t border-primary-foreground/20 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col space-y-3">
              <Button asChild variant="ghost" className="justify-start text-primary-foreground hover:bg-primary-foreground/15 hover:scale-102 text-lg font-medium py-4 px-4 transition-all duration-300 ease-in-out transform">
                <Link to="/about">Hakkımızda</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start text-primary-foreground hover:bg-primary-foreground/15 hover:scale-102 text-lg font-medium py-4 px-4 transition-all duration-300 ease-in-out transform">
                <Link to="/api">API Dokümantasyonu</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start text-primary-foreground hover:bg-primary-foreground/15 hover:scale-102 text-lg font-medium py-4 px-4 transition-all duration-300 ease-in-out transform">
                <Link to="/documentation">Dökümantasyon</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start text-primary-foreground hover:bg-primary-foreground/15 hover:scale-102 text-lg font-medium py-4 px-4 transition-all duration-300 ease-in-out transform">
                <Link to="/contact">İletişim</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
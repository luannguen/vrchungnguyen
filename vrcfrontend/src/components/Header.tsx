import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './header/Logo';
import MainNavigation from './header/MainNavigation';
import LanguageSwitcher from './header/LanguageSwitcher';
import SearchComponent from './header/SearchComponent';
import TopContact from './TopContact';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* TopContact integrated into Header */}
      <TopContact />

      {/* Main header */}
      <header className="bg-primary/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center py-1.5">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <MainNavigation />

            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-4">
              <SearchComponent />
              <LanguageSwitcher />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <SearchComponent isMobile={true} />
              <button onClick={toggleMenu} className="text-white p-1">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary-light/10 backdrop-blur-sm animate-slide-in-right">
            <div className="container-custom py-4">
              <MainNavigation isMobile={true} />
              <LanguageSwitcher isMobile={true} />
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
// import AppLink from '@/components/ui/app-link'; // Not used for dynamic dynamic paths unless modified
import { navigationService } from '@/services/navigationService';
import { NavigationItem } from '@/components/data/types';

interface MainNavigationProps {
  isMobile?: boolean;
}

const MainNavigation = ({ isMobile = false }: MainNavigationProps) => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNav = async () => {
      setIsLoading(true);
      const result = await navigationService.getNavigationItems();
      if (result.success && result.data.length > 0) {
        const headerItems = result.data.filter(item => item.position === 'header' || !item.position); // Default to header if null
        setNavItems(headerItems);
      } else {
        // Fallback or empty? keeping state empty means nothing renders or we could set defaults.
        // For now, let's assume DB has data as per migration.
        // If DB is empty, navigation will be empty.
      }
      setIsLoading(false);
    };

    fetchNav();
  }, []);

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <div key={item.id}>
            <Link to={item.path} className="navbar-link text-lg block py-1">
              {item.label}
            </Link>
            {/* Mobile Submenu handling can be added here if needed */}
            {item.children && item.children.length > 0 && (
              <div className="pl-4 space-y-2 mt-2 border-l border-gray-200">
                {item.children.map(child => (
                  <Link key={child.id} to={child.path} className="text-muted-foreground hover:text-primary block text-base">
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <div key={item.id} className="relative group">
          {item.children && item.children.length > 0 ? (
            <>
              <button className="navbar-link text-base font-medium flex items-center">
                <span>{item.label}</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute hidden group-hover:block bg-white/95 backdrop-blur-sm shadow-lg p-4 rounded min-w-48 right-0 top-full z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col space-y-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      to={child.path}
                      className="text-gray-600 hover:text-primary transition-colors text-sm font-medium py-1"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Link to={item.path} className="navbar-link text-base font-medium">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default MainNavigation;
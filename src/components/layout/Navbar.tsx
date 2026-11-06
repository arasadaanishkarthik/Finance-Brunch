import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ContactPopup } from '@/components/contact/ContactPopup';
import { EASING, DURATIONS } from '@/lib/animations';
import { scrollToSection, scrollToTop } from '@/lib/scrollUtils';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/#services' },
  { 
    name: 'Products', 
    href: '#', 
    children: [
      { name: 'All Products', href: '/#products' },
      { name: 'Mutual Funds', href: '/mutual-funds' },
      { name: 'Mutual Fund Calculator', href: '/calculator' },
      { name: 'Health Insurance', href: '/health-insurance' },
      { name: 'Term Insurance', href: '/term-insurance' },
      { name: 'FIRE Strategy', href: '/fire-strategy' },
      { name: 'Retirement Planning', href: '/retirement-planning' },
      { name: 'Investment Planning', href: '/investment-planning' },
      { name: 'Wealth Management', href: '/wealth-management' },
      { name: 'NRI Services', href: '/nri-services' },
      { name: 'Tax Planning', href: '/tax-planning' },
      { name: 'Indian Stock Analysis', href: '/indian-stock-analysis' },
      { name: 'Unlisted Shares', href: '/unlisted-shares' },
      { name: 'IPO Analysis', href: '/ipo-analysis' },
      { name: 'Insurance Solutions', href: '/insurance-planning' }
    ]
  },
  { name: 'Careers', href: '/careers' },
  { name: 'About', href: '/#about' },
  { name: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Handle scroll shadow effect
  useEffect(() => {
    let previousScrollY = window.scrollY;
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 20);
        setIsScrollingDown(currentScrollY > previousScrollY && currentScrollY > 96);
        previousScrollY = currentScrollY;
        frame = 0;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Handle outside click and Escape key to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Handle dropdown toggle: 1st click opens, 2nd click closes
  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Check if link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' && (!location.hash || location.hash === '#');
    }
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.replace('/', '');
    }
    return location.pathname === href;
  };

  // Check if dropdown button itself should be marked active
  const isDropdownActive = (children?: { name: string; href: string }[]) => {
    if (!children) return false;
    return children.some((child) => {
      if (child.href.startsWith('/#')) {
        return location.pathname === '/' && location.hash === child.href.replace('/', '');
      }
      return location.pathname === child.href;
    });
  };

  // Dedicated Home click handler: consistently scrolls to top whether already on Home or another route
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (location.pathname === '/') {
      if (location.hash) {
        window.history.pushState(null, '', '/');
      }
      scrollToTop(true);
    } else {
      navigate('/');
      scrollToTop(false);
    }
  };

  // Section link click handler (Services, About, Global Presence, and All Products)
  const handleSectionClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    const sectionId = href.replace('/#', '');
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (location.pathname === '/') {
      window.history.pushState(null, '', `#${sectionId}`);
      scrollToSection(sectionId, true);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.documentElement.setAttribute('data-mobile-menu-open', 'true');
    } else {
      document.documentElement.removeAttribute('data-mobile-menu-open');
    }
    return () => {
      document.documentElement.removeAttribute('data-mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.header 
      initial={shouldReduceMotion ? { opacity: 1 } : { y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: DURATIONS.normal, ease: EASING.decelerate }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden",
        isScrollingDown && "shadow-md",
        isScrolled || location.pathname !== '/' 
          ? "bg-white/85 dark:bg-[#080F1F]/85 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800" 
          : "bg-transparent"
      )}
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center justify-between transition-[height] duration-300",
          isScrolled ? "h-16 sm:h-[4.5rem]" : "h-16 sm:h-20"
        )}>
          {/* Logo */}
          <div className="flex-shrink-0 font-display">
            <Link 
              to="/" 
              onClick={handleHomeClick}
              className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950 transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-100"
            >
              <img
                src="/images/finance-brunch-logo-nobg.png"
                alt="Finance Brunch – Financial Advisory & Planning"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain block dark:hidden max-w-[145px] sm:max-w-[180px]"
                style={{ maxWidth: '180px' }}
              />
              <img
                src="/images/finance-brunch-logo-dark.png"
                alt="Finance Brunch – Financial Advisory & Planning"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain hidden dark:block max-w-[145px] sm:max-w-[180px]"
                style={{ maxWidth: '180px' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 md:space-x-2 lg:space-x-5 xl:space-x-6">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative" 
                ref={link.children ? dropdownRef : undefined}
              >
                {link.children ? (
                  <>
                    <button
                      type="button"
                      id="products-dropdown-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(link.name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setActiveDropdown(null);
                        }
                      }}
                      aria-expanded={activeDropdown === link.name}
                      aria-haspopup="true"
                      aria-controls="products-dropdown-menu"
                      className={cn(
                        "group/dropdown relative px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors duration-200 cursor-pointer",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950",
                        activeDropdown === link.name || isDropdownActive(link.children)
                          ? "text-blue-600 dark:text-blue-400 font-semibold" 
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <span>{link.name}</span>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          activeDropdown === link.name ? "rotate-180" : ""
                        )} 
                      />
                      {/* Active underline indicator */}
                      <span 
                        className={cn(
                          "absolute bottom-0 left-3 right-6 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full transition-transform duration-200 ease-out origin-left",
                          activeDropdown === link.name || isDropdownActive(link.children)
                            ? "scale-x-100" 
                            : "scale-x-0 group-hover/dropdown:scale-x-100"
                        )}
                      />
                    </button>
                    
                    {/* Products Dropdown Menu - Explicitly controlled via activeDropdown state */}
                    {activeDropdown === link.name && (
                      <div 
                        id="products-dropdown-menu"
                        role="menu"
                        aria-labelledby="products-dropdown-button"
                        className="absolute left-0 mt-1 w-60 rounded-xl shadow-xl bg-white dark:bg-darkblue-900 border border-gray-200 dark:border-darkblue-700 z-50 transition-all duration-200 ease-out"
                      >
                        <div className="py-2 max-h-[75vh] overflow-y-auto">
                          {link.children.map((childLink) => (
                            <Link
                              key={childLink.name}
                              to={childLink.href}
                              role="menuitem"
                              onClick={(e) => {
                                if (childLink.href.startsWith('/#')) {
                                  handleSectionClick(childLink.href, e);
                                } else {
                                  setActiveDropdown(null);
                                }
                              }}
                              className={cn(
                                "block px-4 py-2 text-sm transition-all duration-150 rounded-md mx-1",
                                "focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-darkblue-800 focus-visible:text-blue-600 dark:focus-visible:text-blue-400",
                                location.pathname === childLink.href
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-darkblue-800/50 font-medium"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1.5"
                              )}
                            >
                              {childLink.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : link.href === '/' ? (
                  <Link
                    to="/"
                    onClick={handleHomeClick}
                    className={cn(
                      "group/navlink relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-block",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950",
                      isActive(link.href) 
                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <span>{link.name}</span>
                    <span 
                      className={cn(
                        "absolute bottom-0 left-3 right-3 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full transition-transform duration-200 ease-out origin-left",
                        isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"
                      )}
                    />
                  </Link>
                ) : link.href.startsWith('/#') ? (
                  <Link
                    to={link.href}
                    onClick={(e) => handleSectionClick(link.href, e)}
                    className={cn(
                      "group/navlink relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-block",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950",
                      isActive(link.href) 
                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <span>{link.name}</span>
                    <span 
                      className={cn(
                        "absolute bottom-0 left-3 right-3 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full transition-transform duration-200 ease-out origin-left",
                        isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"
                      )}
                    />
                  </Link>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => {
                      setActiveDropdown(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "group/navlink relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-block",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950",
                      isActive(link.href) 
                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <span>{link.name}</span>
                    <span 
                      className={cn(
                        "absolute bottom-0 left-3 right-3 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full transition-transform duration-200 ease-out origin-left",
                        isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"
                      )}
                    />
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Pull Cord Anchor and CTA Button */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblue-950"
              onClick={() => navigate('/contact')}
            >
              Get Started
            </Button>
            <div id="pullcord-anchor" className="w-8 h-8 flex items-center justify-center relative pointer-events-none" aria-hidden="true" />
          </div>

          {/* Mobile Menu Button & Pull Cord Anchor */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open main menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <div id="pullcord-anchor-mobile" className="w-8 h-8 flex items-center justify-center relative pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-white/95 dark:bg-darkblue-950/95 backdrop-blur-md border-b border-gray-100 dark:border-darkblue-800",
          isMobileMenuOpen ? "max-h-[85vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <div key={link.name} className="py-1">
              {link.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleDropdown(link.name)}
                    aria-expanded={activeDropdown === link.name}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span>{link.name}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", activeDropdown === link.name && "rotate-180")} />
                  </button>
                  
                  {/* Mobile Dropdown */}
                  <div
                    className={cn(
                      "pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-200",
                      activeDropdown === link.name ? "max-h-96 overflow-y-auto" : "max-h-0"
                    )}
                  >
                    {link.children.map((childLink) => (
                      <Link
                        key={childLink.name}
                        to={childLink.href}
                        onClick={(e) => {
                          if (childLink.href.startsWith('/#')) {
                            handleSectionClick(childLink.href, e);
                          } else {
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        className="block px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                      >
                        {childLink.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : link.href === '/' ? (
                <Link
                  to="/"
                  onClick={handleHomeClick}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive(link.href) 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-darkblue-800 font-semibold" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {link.name}
                </Link>
              ) : link.href.startsWith('/#') ? (
                <Link
                  to={link.href}
                  onClick={(e) => handleSectionClick(link.href, e)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive(link.href) 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-darkblue-800 font-semibold" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {link.name}
                </Link>
              ) : (
                <Link
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive(link.href) 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-darkblue-800 font-semibold" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-darkblue-800 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          <div className="pt-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-sm transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/contact');
              }}
            >
              Get Started
            </Button>
          </div>
          <div className="pt-3 flex items-center justify-between border-t border-gray-100 dark:border-darkblue-800 mt-3 px-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      <ContactPopup open={isContactOpen} onOpenChange={setIsContactOpen} />
    </motion.header>
  );
}

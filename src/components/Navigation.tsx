import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CreateHexedNoteDialog } from './CreateHexedNoteDialog';
import { LoginArea } from './auth/LoginArea';
import { Wand2, BookOpen, Menu, X } from 'lucide-react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { href: '/', label: 'Home', icon: <Wand2 className="h-4 w-4" /> },
    { href: '/hexed-notes', label: 'Hexed Notes', icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Home Link */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 text-lg font-semibold text-slate-100 transition hover:text-purple-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-purple-900/40">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs uppercase tracking-[0.4em] text-purple-200">Hexed</span>
                <span className="block text-base">Notes</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'text-purple-200 bg-purple-500/20'
                    : 'text-slate-300 hover:text-purple-100 hover:bg-slate-800/80'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            <CreateHexedNoteDialog 
              trigger={
                <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 text-slate-50 shadow-md shadow-purple-900/40">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              }
            />
            
            <LoginArea className="max-w-60" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <CreateHexedNoteDialog 
              trigger={
                <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 text-slate-50">
                  <Wand2 className="mr-1 h-4 w-4" />
                  Create
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-10 w-10 p-0"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full text-base font-medium transition ${
                    isActive(item.href)
                      ? 'text-purple-200 bg-purple-500/20'
                      : 'text-slate-300 hover:text-purple-100 hover:bg-slate-800/80'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-3 mt-3">
                <LoginArea className="max-w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

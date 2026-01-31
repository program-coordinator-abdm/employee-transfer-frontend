import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import abdmLogo from "@/assets/abdm-logo.png";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="govt-banner w-full shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Karnataka Government Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-md">
              <img
                src={karnatakaEmblem}
                alt="Government of Karnataka"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-banner-foreground/80">Government of</p>
              <p className="text-sm font-semibold text-banner-foreground">Karnataka</p>
            </div>
          </div>

          {/* Center: App Title */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-banner-foreground tracking-wide">
              Employee Transfer Management
            </h1>
            <p className="text-xs text-banner-foreground/70 hidden sm:block">
              Karnataka State Government Portal
            </p>
          </div>

          {/* Right: ABDM Logo and User Menu */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-md">
              <img
                src={abdmLogo}
                alt="ABDM"
                className="w-10 h-10 object-contain"
              />
            </div>

            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 group">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:block text-sm text-banner-foreground font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-banner-foreground/70 group-hover:text-banner-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-danger focus:text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

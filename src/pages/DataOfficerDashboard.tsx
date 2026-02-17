import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Search, FileText, LogOut } from "lucide-react";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import abdmLogo from "@/assets/abdm-logo.png";

interface ActionCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const DataOfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cards: ActionCard[] = [
    {
      title: "Add Employee",
      description: "Create a new employee record",
      icon: <UserPlus className="w-8 h-8" />,
      onClick: () => navigate("/employee/new"),
    },
    {
      title: "View / Search Employees",
      description: "Browse and search employee records",
      icon: <Search className="w-8 h-8" />,
      onClick: () => navigate("/employee-list"),
    },
    {
      title: "Reports / Exports",
      description: "Coming soon",
      icon: <FileText className="w-8 h-8" />,
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="govt-banner w-full shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border-2 border-border/30 overflow-hidden shadow-md">
                <img src={karnatakaEmblem} alt="Government of Karnataka" className="w-10 h-10 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-banner-foreground/80">Government of</p>
                <p className="text-sm font-semibold text-banner-foreground">Karnataka</p>
              </div>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-banner-foreground">
                Employee Transfer Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border-2 border-border/30 overflow-hidden shadow-md">
                <img src={abdmLogo} alt="ABDM" className="w-10 h-10 object-contain" />
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-banner-foreground transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Data Officer Console</h2>
          <p className="text-muted-foreground mt-1">DH/TH employee details entry & maintenance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={card.onClick}
              disabled={card.disabled}
              className={`card-interactive p-6 text-left flex flex-col items-start gap-4 ${
                card.disabled ? "opacity-60 cursor-not-allowed hover:shadow-md hover:border-border/50" : ""
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                card.disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
              }`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <p className={`text-sm mt-1 ${card.disabled ? "text-muted-foreground italic" : "text-muted-foreground"}`}>
                  {card.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DataOfficerDashboard;

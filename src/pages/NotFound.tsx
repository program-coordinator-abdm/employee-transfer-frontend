import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, FileSearch } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="govt-banner w-full shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-banner-foreground">
              Employee Transfer Management
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <FileSearch className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;

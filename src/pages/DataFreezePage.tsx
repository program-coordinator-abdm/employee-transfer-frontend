import React from "react";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";

const DataFreezePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="govt-banner w-full shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-md">
                <img src={karnatakaEmblem} alt="Government of Karnataka" className="w-10 h-10 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-banner-foreground/80">Government of</p>
                <p className="text-sm font-semibold text-banner-foreground">Karnataka</p>
              </div>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-banner-foreground tracking-wide whitespace-nowrap">
                Health and Family Welfare Department Database
              </h1>
              <p className="text-xs text-banner-foreground/70 hidden sm:block">Karnataka State Government Portal</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-banner-foreground/80">ಸರ್ಕಾರ</p>
                <p className="text-sm font-semibold text-banner-foreground">ಕರ್ನಾಟಕ</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-md">
                <img src={karnatakaEmblem} alt="ಕರ್ನಾಟಕ ಸರ್ಕಾರ" className="w-10 h-10 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Data entries have been frozen
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Further information will be provided
          </p>
          <p className="text-sm text-muted-foreground/70">
            ETMS Portal — Karnataka Health &amp; Family Welfare Department
          </p>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2026 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default DataFreezePage;

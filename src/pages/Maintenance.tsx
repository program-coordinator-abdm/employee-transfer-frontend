import React from "react";
import Header from "@/components/Header";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-7xl mb-6">🚧</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application is Under Service / Under Construction
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            We are currently performing scheduled maintenance to improve your experience.
          </p>
          <p className="text-base text-muted-foreground">
            Your patience is appreciated. Please check back shortly.
          </p>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Maintenance;

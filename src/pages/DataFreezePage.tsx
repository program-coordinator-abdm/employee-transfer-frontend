import React from "react";
import Header from "@/components/Header";

const DataFreezePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
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

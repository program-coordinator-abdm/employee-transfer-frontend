import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { type NewEmployee } from "@/lib/api";

interface KGIDSearchProps {
  onSelect: (employee: NewEmployee) => void;
  /** Optional: pre-filtered employee list to search within */
  employees?: NewEmployee[];
  placeholder?: string;
}

const KGIDSearch: React.FC<KGIDSearchProps> = ({
  onSelect,
  employees: externalEmployees,
  placeholder = "Search by KGID number...",
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allEmployees = externalEmployees ?? [];

  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return allEmployees.filter((emp) => emp.kgid.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allEmployees]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (emp: NewEmployee) => {
    setQuery(emp.kgid);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect(emp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => query.length >= 1 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-9 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          aria-label="Search by KGID"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((emp, index) => (
            <button
              key={emp.id}
              onClick={() => handleSelect(emp)}
              className={`w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 ${
                index === selectedIndex ? "bg-muted/50" : ""
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span className="font-mono text-sm font-medium text-foreground">{emp.kgid}</span>
              <span className="text-xs text-muted-foreground ml-2">— {emp.name}</span>
              <span className="block text-xs text-primary mt-0.5">{emp.designation}</span>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && query.length >= 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-muted-foreground">No employees found with KGID "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default KGIDSearch;

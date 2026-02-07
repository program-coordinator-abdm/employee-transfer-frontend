import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { getSearchSuggestions } from "@/lib/api";
import { Employee } from "@/lib/constants";

interface SearchBarProps {
  onSearch: (query: string, mode: "name" | "kgid") => void;
  onEmployeeSelect?: (employee: Employee) => void;
  category?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onEmployeeSelect, category }) => {
  const [searchMode, setSearchMode] = useState<"name" | "kgid">("name");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSearchSuggestions(searchMode, query, category);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, searchMode, category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        onSearch(query, searchMode);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          onSearch(query, searchMode);
          setShowSuggestions(false);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (employee: Employee) => {
    setQuery(searchMode === "name" ? employee.name : employee.kgid);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch("", searchMode);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-surface rounded-xl p-4 sm:p-6 shadow-elegant border border-border/50" ref={containerRef}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Mode Selection */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="text-sm font-medium text-foreground">Search by:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="searchMode"
                value="name"
                checked={searchMode === "name"}
                onChange={() => {
                  setSearchMode("name");
                  setQuery("");
                  setSuggestions([]);
                }}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                Employee Name
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="searchMode"
                value="kgid"
                checked={searchMode === "kgid"}
                onChange={() => {
                  setSearchMode("kgid");
                  setQuery("");
                  setSuggestions([]);
                }}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                Emp ID / KGID
              </span>
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder={
                searchMode === "name"
                  ? "Type employee name to search..."
                  : "Type employee ID / KGID to search..."
              }
              className="input-field pl-12 pr-10"
              aria-label="Search employees"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="search-suggestions"
              className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-50 max-h-80 overflow-y-auto animate-scale-in"
              role="listbox"
            >
              {suggestions.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelectSuggestion(employee)}
                  className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 ${
                    index === selectedIndex ? "bg-muted/50" : ""
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.kgid}</p>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-50 p-6 text-center animate-scale-in">
              <p className="text-muted-foreground">No employees found matching "{query}"</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-50 p-4 text-center animate-scale-in">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Searching...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input, Select, Button } from "@/components/ui";

interface LibraryControlsProps {
  availableTags: string[];
}

export default function LibraryControls({ availableTags }: LibraryControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "updated_desc");

  // Update URL when filters change
  const updateURL = (q: string, tag: string, sort: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (sort && sort !== "updated_desc") params.set("sort", sort);
    
    const queryString = params.toString();
    router.replace(queryString ? `/library?${queryString}` : "/library");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL(value, selectedTag, sortOption);
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
    updateURL(searchTerm, value, sortOption);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    updateURL(searchTerm, selectedTag, value);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedTag("");
    setSortOption("updated_desc");
    router.replace("/library");
  };

  const hasFilters = searchTerm || selectedTag || sortOption !== "updated_desc";

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <Input
        id="search"
        type="text"
        label="Suche"
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Titel oder Beschreibung durchsuchen..."
      />

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tag Filter */}
        <div className="flex-1">
          <Select
            id="tag"
            label="Tag Filter"
            value={selectedTag}
            onChange={(e) => handleTagChange(e.target.value)}
          >
            <option value="">Alle Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex-1">
          <Select
            id="sort"
            label="Sortierung"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="updated_desc">Zuletzt geändert (neueste zuerst)</option>
            <option value="updated_asc">Zuletzt geändert (älteste zuerst)</option>
            <option value="title_asc">Titel (A-Z)</option>
            <option value="title_desc">Titel (Z-A)</option>
            <option value="created_desc">Erstellt (neueste zuerst)</option>
            <option value="created_asc">Erstellt (älteste zuerst)</option>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button onClick={handleReset} variant="outline" className="w-full">
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}

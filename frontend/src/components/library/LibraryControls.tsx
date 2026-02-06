"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Suche
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Titel oder Beschreibung durchsuchen..."
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tag Filter */}
        <div className="flex-1">
          <label htmlFor="tag" className="block text-sm font-medium mb-2">
            Tag Filter
          </label>
          <select
            id="tag"
            value={selectedTag}
            onChange={(e) => handleTagChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex-1">
          <label htmlFor="sort" className="block text-sm font-medium mb-2">
            Sortierung
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated_desc">Zuletzt geändert (neueste zuerst)</option>
            <option value="updated_asc">Zuletzt geändert (älteste zuerst)</option>
            <option value="title_asc">Titel (A-Z)</option>
            <option value="title_desc">Titel (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <div>
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}

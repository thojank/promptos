"use client";

import { useState, useRef, useEffect } from "react";

export type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
};

function normalizeTag(tag: string) {
  return tag.trim().replace(/\s+/g, " ").slice(0, 24);
}

export default function TagInput({ value, onChange, suggestions, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions
  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.some(v => v.toLowerCase() === s.toLowerCase()))
    .sort();

  // Option für neuen Tag
  const showCreate = input && !suggestions.some(s => s.toLowerCase() === input.toLowerCase()) && !value.some(v => v.toLowerCase() === input.toLowerCase());

  // Chips entfernen
  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Tag hinzufügen
  const addTag = (tag: string) => {
    const norm = normalizeTag(tag);
    if (!norm) return;
    if (value.some(v => v.toLowerCase() === norm.toLowerCase())) return;
    onChange([...value, norm]);
    setInput("");
    setDropdownOpen(false);
    setHighlight(0);
    if (inputRef.current) inputRef.current.focus();
  };

  // Enter/Klick
  const handleSelect = (idx?: number) => {
    if (showCreate && (idx === undefined || idx === filtered.length)) {
      addTag(input);
    } else if (filtered.length > 0) {
      addTag(filtered[idx ?? highlight]);
    }
  };

  // Input Events
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setDropdownOpen(true);
    setHighlight(0);
  };

  // Komma als Separator
  useEffect(() => {
    if (input.includes(",")) {
      const parts = input.split(",").map(normalizeTag).filter(Boolean);
      const newTags = parts.filter(p => !value.some(v => v.toLowerCase() === p.toLowerCase()));
      if (newTags.length) {
        onChange([...value, ...newTags]);
        setInput("");
        setDropdownOpen(false);
        setHighlight(0);
      }
    }
  }, [input, value, onChange]);

  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect();
    } else if (e.key === "ArrowDown") {
      setDropdownOpen(true);
      setHighlight(h => Math.min(filtered.length + (showCreate ? 1 : 0) - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      setDropdownOpen(true);
      setHighlight(h => Math.max(0, h - 1));
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    } else if (e.key === "Backspace" && !input) {
      onChange(value.slice(0, -1));
    }
  };

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 items-center mb-1">
        {value.map((tag, idx) => (
          <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded flex items-center">
            {tag}
            <button
              type="button"
              className="ml-1 text-blue-700 dark:text-blue-300 hover:text-red-500"
              onClick={() => removeTag(idx)}
              aria-label="Tag entfernen"
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Tag hinzufügen"}
          className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border-none outline-none text-sm"
          style={{ minWidth: 120 }}
        />
      </div>
      {dropdownOpen && (filtered.length > 0 || showCreate) && (
        <div className="absolute mt-1 w-full z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg">
          {filtered.map((s, idx) => (
            <div
              key={s}
              className={`px-3 py-2 cursor-pointer ${highlight === idx ? "bg-blue-100 dark:bg-blue-900" : ""}`}
              onMouseDown={() => handleSelect(idx)}
              onMouseEnter={() => setHighlight(idx)}
            >{s}</div>
          ))}
          {showCreate && (
            <div
              className={`px-3 py-2 cursor-pointer ${highlight === filtered.length ? "bg-blue-100 dark:bg-blue-900" : ""}`}
              onMouseDown={() => handleSelect(filtered.length)}
              onMouseEnter={() => setHighlight(filtered.length)}
            >+ Tag anlegen: &quot;{input}&quot;</div>
          )}
        </div>
      )}
    </div>
  );
}

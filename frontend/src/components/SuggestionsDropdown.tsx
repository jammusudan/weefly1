"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface SuggestionsDropdownProps {
    suggestions: any[];
    isLoading: boolean;
    activeIndex: number;
    onSelect: (suggestion: any) => void;
    query: string;
}

const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-accent font-black">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
    suggestions,
    isLoading,
    activeIndex,
    onSelect,
    query,
}) => {
    if (!isLoading && suggestions.length === 0 && query.length >= 2) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 p-6 text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No results found
                </p>
            </div>
        );
    }

    if (isLoading || suggestions.length > 0) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100/50">
                {isLoading && (
                    <div className="p-6 flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                            Searching...
                        </span>
                    </div>
                )}
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onSelect(s);
                        }}
                        className={`w-full flex items-center gap-4 p-4 text-left transition-all ${activeIndex === i ? "bg-accent/10" : "hover:bg-gray-50/50"
                            }`}
                    >
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <MapPin size={14} className="text-gray-400" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-bold text-primary truncate leading-tight">
                                {highlightMatch(s.display_name, query)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                                {s.type} • India
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return null;
};

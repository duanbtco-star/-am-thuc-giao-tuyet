'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { findSimilarItems, formatCurrency } from '@/lib/utils';

interface MenuItem {
    id: string;
    name: string;
    unit: string;
    selling_price: number;
    cost_price: number;
}

interface AutocompleteTextareaProps {
    value: string;
    onChange: (value: string) => void;
    menuItems: MenuItem[];
    placeholder?: string;
    rows?: number;
    tableCount: number;
    className?: string;
}

export default function AutocompleteTextarea({
    value,
    onChange,
    menuItems,
    placeholder,
    rows = 10,
    tableCount,
    className = '',
}: AutocompleteTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentLineStart, setCurrentLineStart] = useState(0);
    const [currentLineEnd, setCurrentLineEnd] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // Get the current line being edited
    const getCurrentLine = useCallback(() => {
        if (!textareaRef.current) return { line: '', start: 0, end: 0 };

        const cursorPos = textareaRef.current.selectionStart;
        const text = value;

        // Find start of current line
        let lineStart = cursorPos;
        while (lineStart > 0 && text[lineStart - 1] !== '\n') {
            lineStart--;
        }

        // Find end of current line
        let lineEnd = cursorPos;
        while (lineEnd < text.length && text[lineEnd] !== '\n') {
            lineEnd++;
        }

        const line = text.substring(lineStart, cursorPos);
        return { line, start: lineStart, end: lineEnd };
    }, [value]);

    // Update suggestions based on current line input
    const updateSuggestions = useCallback(() => {
        const { line, start, end } = getCurrentLine();
        setCurrentLineStart(start);
        setCurrentLineEnd(end);

        // Extract dish name (remove quantity if present)
        let searchTerm = line.trim();
        const quantityMatch = searchTerm.match(/^(.+?)\s*[xX×\-]\s*\d+$/) ||
            searchTerm.match(/^\d+\s*[xX×\-]?\s*(.+)$/);
        if (quantityMatch) {
            searchTerm = quantityMatch[1]?.trim() || searchTerm;
        }

        if (searchTerm.length < 2) {
            setShowSuggestions(false);
            setSuggestions([]);
            return;
        }

        // Find matching items
        const matches = findSimilarItems(searchTerm, menuItems, { threshold: 0.3, limit: 5 });

        if (matches.length > 0) {
            setSuggestions(matches.map(m => m.item));
            setSelectedIndex(0);
            setShowSuggestions(true);

            // Calculate dropdown position
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                const { scrollTop, scrollLeft } = textarea;

                // Get line number
                const lines = value.substring(0, textarea.selectionStart).split('\n');
                const lineNumber = lines.length;
                const lineHeight = 20; // Approximate line height

                setDropdownPosition({
                    top: (lineNumber * lineHeight) - scrollTop + 4,
                    left: 0
                });
            }
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [getCurrentLine, menuItems, value]);

    // Handle text change
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    // Update suggestions when value changes
    useEffect(() => {
        const timer = setTimeout(updateSuggestions, 150);
        return () => clearTimeout(timer);
    }, [value, updateSuggestions]);

    // Select a suggestion
    const selectSuggestion = useCallback((item: MenuItem) => {
        const { start, end } = { start: currentLineStart, end: currentLineEnd };

        // Check if there was a quantity specified
        const currentLine = value.substring(start, end);
        const quantityMatch = currentLine.match(/[xX×\-]\s*(\d+)\s*$/) ||
            currentLine.match(/^(\d+)\s*[xX×\-]/);
        const quantity = quantityMatch ? quantityMatch[1] : null;

        // Build new line
        const newLine = quantity ? `${item.name} x ${quantity}` : item.name;

        // Replace current line with selected item
        const newValue = value.substring(0, start) + newLine + value.substring(end);
        onChange(newValue);

        setShowSuggestions(false);
        setSuggestions([]);

        // Move cursor to end of inserted text and add new line
        setTimeout(() => {
            if (textareaRef.current) {
                const newPos = start + newLine.length;
                textareaRef.current.selectionStart = newPos;
                textareaRef.current.selectionEnd = newPos;
                textareaRef.current.focus();
            }
        }, 0);
    }, [value, onChange, currentLineStart, currentLineEnd]);

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                if (suggestions[selectedIndex]) {
                    e.preventDefault();
                    selectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                break;
            case 'Tab':
                if (suggestions[selectedIndex]) {
                    e.preventDefault();
                    selectSuggestion(suggestions[selectedIndex]);
                }
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                className={`${className} ${showSuggestions ? 'rounded-b-none' : ''}`}
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                    style={{ top: '100%' }}
                >
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-text-secondary" />
                        <span className="text-xs text-text-secondary">
                            Gợi ý món ăn • ↑↓ để chọn • Enter để xác nhận
                        </span>
                    </div>
                    {suggestions.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => selectSuggestion(item)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${index === selectedIndex
                                    ? 'bg-accent/10 border-l-2 border-accent'
                                    : 'hover:bg-gray-50 border-l-2 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className={`w-4 h-4 ${index === selectedIndex ? 'text-accent' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`font-medium ${index === selectedIndex ? 'text-accent' : 'text-primary'}`}>
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-text-secondary">{item.unit}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${index === selectedIndex ? 'text-accent' : 'text-primary'}`}>
                                    {formatCurrency(item.selling_price)}
                                </p>
                                <p className="text-xs text-green-600">
                                    +{formatCurrency(item.selling_price - item.cost_price)} lợi nhuận
                                </p>
                            </div>
                        </button>
                    ))}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-text-secondary">
                            💡 Mặc định: {tableCount} phần (= số bàn). Thêm "x số lượng" để thay đổi.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

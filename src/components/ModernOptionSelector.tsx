import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface OptionItem {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  color?: string;
}

export interface ModernOptionSelectorProps {
  value: string;
  onChange: (val: string) => void;
  options: (string | OptionItem)[];
  placeholder?: string;
  disabled?: boolean;
  inlineChips?: boolean; // Force chips representation if true, combobox if false
  searchable?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: 'xs' | 'sm' | 'md';
  clearable?: boolean;
}

export const ModernOptionSelector: React.FC<ModernOptionSelectorProps> = ({
  value,
  onChange,
  options,
  placeholder = '-- Pilih Opsi --',
  disabled = false,
  inlineChips,
  searchable,
  label,
  required,
  className = '',
  triggerClassName = '',
  size = 'sm',
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to objects
  const normalizedOptions: OptionItem[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Decide if we should render inline chips (default true if <= 5 options and not explicitly set to false)
  const shouldRenderChips = inlineChips !== undefined ? inlineChips : normalizedOptions.length <= 5;

  // Filter options if searchable or when searching
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  });

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOpt = normalizedOptions.find((o) => o.value === value);

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px]',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-xs',
  }[size];

  // 1. RENDER CHIPS/PILLS FOR SHORT LISTS
  if (shouldRenderChips) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label className="block font-bold text-slate-700 text-[11px]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="flex flex-wrap gap-1.5">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(opt.value)}
                className={`${sizeClasses} rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#A21D21] text-white border-[#A21D21] shadow-xs scale-[1.02]'
                    : 'bg-[#FAF8F5] text-slate-700 border-[#E2E0D8] hover:bg-white hover:border-slate-300 hover:text-slate-900'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSelected && <Check size={12} className="shrink-0 stroke-[3]" />}
                <span>{opt.label}</span>
                {opt.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. RENDER SEARCHABLE MODERN COMBOBOX / POPOVER FOR LONGER LISTS
  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-bold text-slate-700 text-[11px]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-white border rounded-xl ${sizeClasses} flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#A21D21] ring-2 ring-red-100 shadow-sm'
            : 'border-[#E2E0D8] hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOpt ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 truncate">{selectedOpt.label}</span>
              {selectedOpt.badge && (
                <span className="text-[9.5px] bg-red-50 text-[#A21D21] border border-red-200 px-1.5 py-0.2 rounded-md font-extrabold shrink-0">
                  {selectedOpt.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          {clearable && value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-slate-600 rounded cursor-pointer"
              title="Hapus pilihan"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#A21D21]' : ''}`}
          />
        </div>
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#E2E0D8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-72 min-w-[200px]">
          {/* Search Box */}
          {normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-[#FAF8F5] sticky top-0 z-10 flex items-center gap-2">
              <Search size={13} className="text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                placeholder="Cari opsi / filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal py-0.5"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada opsi yang cocok
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 text-[#A21D21] font-bold border border-red-200 shadow-2xs'
                        : 'hover:bg-[#FAF8F5] text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-[#A21D21] shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface PageHeaderBannerProps {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  tabs?: {
    id: string;
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
    badge?: string;
  }[];
  activeTab?: string;
  onSelectTab?: (id: any) => void;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  category,
  title,
  description,
  icon,
  rightElement,
  tabs,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner Box */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_8px_-2px_rgba(28,20,15,0.03)] p-5 sm:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left Title & Description */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#96171B] border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-[#96171B] uppercase">
                  {category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Right Action Element */}
          {rightElement && (
            <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
              {rightElement}
            </div>
          )}

        </div>
      </div>

      {/* Segmented Sub-tabs Switcher */}
      {tabs && tabs.length > 0 && onSelectTab && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex p-1 bg-[#ECE7DE] rounded-xl border border-stone-200/70">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                  }`}
                >
                  {Icon && <Icon size={14} className={active ? 'text-[#96171B]' : 'text-stone-400'} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        active
                          ? 'text-[#96171B] font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ({tab.count})
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[10px] text-amber-700 font-medium ml-0.5">
                      · {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

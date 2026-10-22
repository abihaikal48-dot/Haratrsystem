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
    <div className="space-y-3.5">
      {/* Top Banner Box - Clean Geometri 8px & Border 1px */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left Title & Description */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#96171B] border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold tracking-wider text-[#96171B] uppercase">
                  {category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-3xl leading-relaxed">
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

      {/* Segmented Sub-tabs Switcher (Clean 8px & 1px Border) */}
      {tabs && tabs.length > 0 && onSelectTab && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex p-1 bg-neutral-100 rounded-lg border border-neutral-200 gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white text-neutral-900 font-bold border border-neutral-200 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  {Icon && <Icon size={14} className={active ? 'text-[#96171B]' : 'text-neutral-400'} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        active
                          ? 'text-[#96171B] font-bold'
                          : 'text-neutral-400'
                      }`}
                    >
                      ({tab.count})
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[10px] text-neutral-500 font-normal">
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

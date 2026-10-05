import React, { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import {
  MotivationalQuote,
  getRandomMotivationalQuote,
} from '../data/motivationalQuotes';

interface MotivationalQuoteCardProps {
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
}

export const MotivationalQuoteCard: React.FC<MotivationalQuoteCardProps> = ({
  className = '',
  variant = 'inline',
}) => {
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(() =>
    getRandomMotivationalQuote()
  );
  const [isRotating, setIsRotating] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(true);

  // Re-generate / rotate quote
  const handleNextQuote = () => {
    setIsRotating(true);
    setFadeAnim(false);

    setTimeout(() => {
      setCurrentQuote((prev) => getRandomMotivationalQuote(prev.id));
      setFadeAnim(true);
      setTimeout(() => setIsRotating(false), 250);
    }, 150);
  };

  if (variant === 'inline') {
    return (
      <div
        className={`relative rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] p-3.5 sm:p-4 text-left transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#96171B] bg-red-100/60 px-2 py-0.5 rounded border border-red-200/50"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Sententia
            </span>
            {currentQuote.latinMotto && (
              <span
                className="text-[10px] text-amber-800 font-semibold tracking-wide hidden sm:inline"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                &bull; {currentQuote.latinMotto}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextQuote}
            title="Ganti ke kutipan inspirasi lain"
            className="flex items-center gap-1 text-[10.5px] font-bold text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw
              size={11}
              className={`transition-transform duration-500 ${
                isRotating ? 'rotate-180 text-[#96171B]' : ''
              }`}
            />
            <span className="text-[10px]">Ganti</span>
          </button>
        </div>

        <div
          className={`mt-2 transition-opacity duration-200 ${
            fadeAnim ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p
            className="text-xs text-stone-700 italic font-medium leading-relaxed pl-3 border-l-2 border-amber-500"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            "{currentQuote.quote}"
          </p>
          <div className="mt-1.5 pl-3 flex items-center gap-1.5 text-[10.5px] text-stone-500">
            <span className="font-extrabold text-stone-800">
              {currentQuote.author}
            </span>
            <span>&bull;</span>
            <span className="text-stone-500">{currentQuote.role}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl bg-white border border-[#E8E3D8] shadow-xs p-4 sm:p-5 transition-all hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#96171B]/10 text-[#96171B] flex items-center justify-center">
            <Quote size={13} className="fill-[#96171B]" />
          </div>
          <span
            className="text-[11px] font-black uppercase tracking-[0.2em] text-[#96171B]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Sententia Diei
          </span>
          <span className="text-stone-300">&bull;</span>
          <span className="text-[10px] text-stone-500 font-semibold tracking-wide uppercase">
            Inspirasi Standar Mutu
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextQuote}
          title="Tampilkan kutipan inspirasi lainnya"
          className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 transition-all cursor-pointer"
        >
          <RefreshCw
            size={11}
            className={`transition-transform duration-500 text-stone-500 group-hover:text-stone-800 ${
              isRotating ? 'rotate-180 text-[#96171B]' : ''
            }`}
          />
          <span className="hidden sm:inline">Ganti Kutipan</span>
        </button>
      </div>

      <div
        className={`transition-opacity duration-200 ${
          fadeAnim ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p
          className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed italic relative pl-4 border-l-2 border-amber-400"
          style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          "{currentQuote.quote}"
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-stone-900">
              {currentQuote.author}
            </span>
            <span className="text-stone-400">&bull;</span>
            <span className="text-stone-500 font-medium">
              {currentQuote.role}
            </span>
          </div>

          {currentQuote.latinMotto && (
            <div
              className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70"
              style={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.08em' }}
            >
              {currentQuote.latinMotto}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

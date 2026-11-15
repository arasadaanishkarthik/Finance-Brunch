import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuildingIcon, MapPin, Users, Plane, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MapComponent, { officeLocations } from './MapComponent';
import { FadeIn } from '@/components/ui/animation';

// Country flag emoji helper
const countryFlag: Record<string, string> = {
  India: '🇮🇳',
  UAE: '🇦🇪',
  USA: '🇺🇸',
  Canada: '🇨🇦',
  UK: '🇬🇧',
  Spain: '🇪🇸',
};

export default function GlobalPresence() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <section id="global" className="py-12 sm:py-16 lg:py-20 bg-transparent scroll-mt-20">
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 mx-auto space-y-8">

        {/* Section Header */}
        <FadeIn direction="up" className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wide mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Our Global Presence
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We provide localized expertise with a global perspective.
          </p>
        </FadeIn>

        {/* Global Summary Badge Bar */}
        <FadeIn direction="up" delay={0.08} className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-slate-900 dark:text-white font-semibold">8 Global Hubs</strong>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">•</div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span>Global HQ in</span>
              <strong className="text-primary font-semibold">Vizag, India</strong>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">•</div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cross-Border NRI Advisory</span>
            </div>
          </div>
        </FadeIn>

        {/* Animated Interactive Map (Centerpiece) */}
        <FadeIn direction="up" delay={0.15} className="w-full">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent shadow-2xl">
            <MapComponent 
              selectedCity={selectedCity} 
              onSelectCity={setSelectedCity}
              className="w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px] rounded-[22px]"
            />
          </div>
        </FadeIn>

        {/* Interactive Office Hubs Ribbon (Click / Hover to focus on map) */}
        <FadeIn direction="up" delay={0.25} className="w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>Explore Financial Hubs:</span>
              <span className="font-normal font-mono text-[11px]">Hover or click a city to highlight on map</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
              {officeLocations.map((office) => {
                const isSelected = selectedCity?.toLowerCase() === office.city.toLowerCase();
                const isHQ = Boolean(office.isHQ || office.isMain);
                const flag = countryFlag[office.country] ?? '🌐';

                return (
                  <button
                    key={office.city}
                    type="button"
                    onMouseEnter={() => setSelectedCity(office.city)}
                    onMouseLeave={() => setSelectedCity(null)}
                    onClick={() => setSelectedCity(isSelected ? null : office.city)}
                    className={cn(
                      "group text-left px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1 select-none",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md -translate-y-0.5 scale-[1.02]"
                        : isHQ
                        ? "bg-white dark:bg-slate-900 border-primary/40 hover:border-primary shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-primary/40 shadow-2xs"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base select-none leading-none">{flag}</span>
                      {isHQ ? (
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded",
                          isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}>
                          HQ
                        </span>
                      ) : (
                        <MapPin className={cn(
                          "w-3 h-3 transition-colors",
                          isSelected ? "text-white" : "text-slate-400 group-hover:text-primary"
                        )} />
                      )}
                    </div>

                    <div>
                      <p className={cn(
                        "text-xs font-bold leading-tight truncate",
                        isSelected ? "text-white" : "text-slate-900 dark:text-white group-hover:text-primary"
                      )}>
                        {office.city}
                      </p>
                      <p className={cn(
                        "text-[10px] leading-tight truncate mt-0.5",
                        isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {office.country}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Consultation & NRI Services Actions */}
        <FadeIn direction="up" delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2 max-w-md mx-auto">
            <Button 
              onClick={() => navigate('/contact')}
              className="flex-1 h-11 text-sm font-semibold shadow-md shadow-blue-500/20 button-hover group hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Users className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              Schedule a Consultation
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/nri-services')}
              className="flex-1 h-11 text-sm font-semibold border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plane className="mr-2 h-4 w-4" />
              NRI Services
            </Button>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}

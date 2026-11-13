import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuildingIcon, MapPin, Users, Plane, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { officeLocations } from './MapComponent';
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
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <section id="global" className="py-10 sm:py-14 lg:py-16 bg-transparent scroll-mt-20">
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 mx-auto">

        {/* Section header */}
        <FadeIn direction="up" className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wide mb-2.5">
            Global Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-2.5">
            Our Global Presence
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            We provide localized expertise with a global perspective.
          </p>
        </FadeIn>

        {/* Summary bar */}
        <FadeIn direction="up" delay={0.08}>
          <div className="flex items-center gap-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/15 shadow-sm mb-6 max-w-sm mx-auto sm:max-w-none sm:mx-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                8 Global Offices
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Serving clients across major financial centers worldwide
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Office cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {officeLocations.map((office, idx) => {
            const isHQ = Boolean(office.isHQ || office.isMain);
            const isHovered = hoveredCity === office.city;
            const flag = countryFlag[office.country] ?? '🌐';

            return (
              <FadeIn key={office.city} direction="up" delay={0.06 + idx * 0.07}>
                <div
                  onMouseEnter={() => setHoveredCity(office.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className={cn(
                    'relative group flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden',
                    isHovered
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 -translate-y-1'
                      : isHQ
                        ? 'bg-white dark:bg-slate-900 border-primary/40 border-l-4 border-l-primary shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/40'
                  )}
                >
                  {/* Animated radar ring on hover */}
                  {isHovered && (
                    <>
                      <span className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-primary/40 animate-ping" />
                      <span className="absolute top-5 right-5 w-6 h-6 rounded-full border border-primary/60 animate-ping [animation-delay:0.3s]" />
                    </>
                  )}

                  {/* Flag + icon row */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl leading-none select-none" aria-label={office.country}>
                      {flag}
                    </span>
                    {isHQ ? (
                      <BuildingIcon className={cn('h-4 w-4 transition-colors', isHovered ? 'text-primary' : 'text-primary/70')} />
                    ) : (
                      <MapPin className={cn('h-4 w-4 transition-colors', isHovered ? 'text-primary' : 'text-slate-400 group-hover:text-primary')} />
                    )}
                  </div>

                  {/* City & description */}
                  <div>
                    <p className={cn('text-sm font-semibold transition-colors', isHovered ? 'text-primary' : 'text-slate-800 dark:text-slate-200')}>
                      {office.city}, {office.country}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {office.description}
                    </p>
                  </div>

                  {/* HQ badge */}
                  {isHQ && (
                    <span className="self-start text-[10px] font-medium tracking-wide uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Headquarters
                    </span>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* CTA buttons */}
        <FadeIn direction="up" delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/contact')}
              className="h-10 px-6 text-sm button-hover group hover:-translate-y-0.5 active:translate-y-0 hover:shadow-sm transition-all duration-200"
            >
              <Users className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              Schedule a Consultation
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/nri-services')}
              className="h-10 px-6 text-sm border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5"
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

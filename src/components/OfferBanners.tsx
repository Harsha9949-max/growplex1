import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOffers } from "../hooks/useOffers";

export function OfferBanners({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const { offers } = useOffers(position);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000); // 5 seconds auto-slide
    return () => clearInterval(interval);
  }, [offers.length]);

  if (offers.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % offers.length);
  const prev = () => setCurrentIndex((curr) => (curr === 0 ? offers.length - 1 : curr - 1));

  const currentOffer = offers[currentIndex];

  const handleBannerClick = () => {
    if (currentOffer.link) {
      if (currentOffer.link.startsWith("http")) {
        window.open(currentOffer.link, "_blank");
      } else {
        window.location.href = currentOffer.link; // internal link like /services
      }
    }
  };

  return (
    <div className="w-full relative overflow-hidden bg-brand-surface border-y border-brand-border">
      <div className="w-full max-w-7xl mx-auto relative group">
        <a 
          href={currentOffer.link && currentOffer.link.trim() !== '' ? currentOffer.link : undefined}
          target={currentOffer.link?.startsWith('http') ? '_blank' : '_self'}
          className={`block w-full relative ${currentOffer.link ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={(e) => {
             if (!currentOffer.link || currentOffer.link.trim() === '') {
                e.preventDefault();
             }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOffer.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full"
            >
              <img 
                src={currentOffer.desktopImageUrl} 
                alt="Offer Banner" 
                className="hidden md:block w-full h-auto object-contain"
              />
              <img 
                src={currentOffer.mobileImageUrl} 
                alt="Offer Banner" 
                className="block md:hidden w-full h-auto object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </a>

        {/* Controls */}
        {offers.length > 1 && (
          <>
             <button 
               onClick={(e) => { e.stopPropagation(); prev(); }}
               className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-colors z-10"
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); next(); }}
               className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-colors z-10"
             >
               <ChevronRight size={20} />
             </button>
             
             {/* Dots */}
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
               {offers.map((_, idx) => (
                 <button
                   key={idx}
                   onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                   className={`h-1.5 rounded-full transition-all ${
                     idx === currentIndex ? "w-4 bg-brand-accent" : "w-1.5 bg-white/50 hover:bg-white/80"
                   }`}
                 />
               ))}
             </div>
          </>
        )}
      </div>
    </div>
  );
}

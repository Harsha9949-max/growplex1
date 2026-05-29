import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { OfferBanner } from "../pages/AdminOffers";

export function useOffers(position: 'top' | 'bottom' = 'top') {
  const [offers, setOffers] = useState<OfferBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "offers"), where("isActive", "==", true)), (snap) => {
      const data: OfferBanner[] = [];
      snap.forEach(d => {
         const offer = { id: d.id, ...d.data() } as OfferBanner;
         const offerPos = offer.position || 'top';
         if (offerPos === position) {
            data.push(offer);
         }
      });
      data.sort((a, b) => {
        const tA = a.createdAt?.toMillis?.() || 0;
        const tB = b.createdAt?.toMillis?.() || 0;
        return tB - tA;
      });
      setOffers(data.slice(0, 3));
      setLoading(false);
    });
    return () => unsub();
  }, [position]);

  return { offers, loading, hasOffers: offers.length > 0 };
}

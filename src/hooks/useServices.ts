import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { Service } from "../types";
import { BASE_SERVICES } from "../pages/Services";

function applyMargin(services: Service[], globalMargin: number): Service[] {
  return services.map(s => {
    // Determine the margin for this specific service
    let serviceMargin = globalMargin;
    if ((s as any).type === 'synced' && (s as any).marginPercentage !== undefined) {
      serviceMargin = Number((s as any).marginPercentage);
    }

    return {
      ...s,
      marginPercentage: serviceMargin,
      packages: s.packages.map(pkg => {
        // 1. Get the best base value
        let base: any = pkg.basePrice !== undefined && pkg.basePrice !== null ? pkg.basePrice : pkg.price;
        
        // 2. Strip any non-numeric characters if it's stored as a string like "₹8" or "8"
        if (typeof base === "string") {
          base = parseFloat(base.replace(/[^0-9.-]/g, "")) || 0;
        }
        
        // 3. Fallback to 0 if still invalid
        base = Number(base) || 0;

        // 4. Calculate final retail price based on base price + margin
        // But for synced services, they are synced with base values as per 1000 quantity. 
        // AdminServices already stored `basePriceInr` in `pkg.basePrice` correctly for 1000 items.
        // Packages quantity might not be 1000. So we calculate: price = (base / 1000) * quantity * (1 + margin / 100)
        const margin = Number(serviceMargin) || 0;

        if ((s as any).type === 'synced') {
          const qtyVal = parseFloat(pkg.quantity.replace(/[^0-9.-]/g, "")) || 1000;
          return {
            ...pkg,
            basePrice: base,
            price: Math.max(1, Math.ceil(base * (qtyVal / 1000) * (1 + margin / 100))) // apply markup only for API synced 
          };
        }

        // For manual "standard" and "special" packages, DO NOT apply global margin. 
        // The admin manually typed exactly what they want to charge (the retail price).
        return {
          ...pkg,
          basePrice: base,
          price: base
        };
      })
    };
  });
}

export function useServices() {
  const [marginSetting, setMarginSetting] = useState<number>(40);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubMargin = onSnapshot(doc(db, "system", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.defaultMarkupMargin === "number") {
          setMarginSetting(data.defaultMarkupMargin);
        }
      }
    }, (err) => {
      console.error("Failed to fetch margin setting:", err);
    });

    return () => unsubMargin();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "services"), where("status", "==", "active"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Service[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          ...data,
          name: data.serviceName || data.name
        } as Service);
      });
      setDbServices(fetched.length > 0 ? fetched : BASE_SERVICES);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch services:", err);
      setDbServices(BASE_SERVICES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const servicesWithMargin = useMemo(() => {
    return applyMargin(dbServices, marginSetting);
  }, [dbServices, marginSetting]);

  return { services: servicesWithMargin, loading };
}

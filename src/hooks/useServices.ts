import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { Service } from "../types";
import { BASE_SERVICES } from "../pages/Services";

function applyMargin(services: Service[], marginPercent: number): Service[] {
  return services.map(s => ({
    ...s,
    packages: s.packages.map(pkg => {
      // 1. Get the best base value
      let base: any = pkg.basePrice !== undefined && pkg.basePrice !== null ? pkg.basePrice : pkg.price;
      
      // 2. Strip any non-numeric characters if it's stored as a string like "₹8" or "8"
      if (typeof base === "string") {
        base = parseFloat(base.replace(/[^0-9.-]/g, "")) || 0;
      }
      
      // 3. Fallback to 0 if still invalid
      base = Number(base) || 0;

      // 4. Ensure margin is a valid number
      const margin = typeof marginPercent === "number" ? marginPercent : Number(marginPercent) || 40;

      return {
        ...pkg,
        basePrice: base,
        price: Math.max(0, Math.ceil(base * (1 + margin / 100)))
      };
    })
  }));
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

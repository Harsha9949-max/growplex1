import { Firestore, doc, setDoc } from "firebase/firestore";

function sanitizeEnvVar(val: string | undefined): string | undefined {
  if (!val) return undefined;
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.substring(1, s.length - 1);
  } else if (s.startsWith("'") && s.endsWith("'")) {
    s = s.substring(1, s.length - 1);
  }
  return s.trim();
}

export interface CashfreeEnvInfo {
  mode: "TEST" | "PRODUCTION";
  appId: string;
  secretKey: string;
  endpoint: string;
}

export function validateCashfreeConfig(): CashfreeEnvInfo {
  const appId = sanitizeEnvVar(process.env.CASHFREE_APP_ID);
  const secretKey = sanitizeEnvVar(process.env.CASHFREE_SECRET_KEY);
  
  if (!appId || !secretKey) {
    throw new Error("Cashfree configuration invalid: Missing App ID or Secret Key");
  }

  // Auto-detect mode based on the App ID prefix. Cashfree test keys start with 'TEST'
  const isTestAppId = appId.toUpperCase().startsWith("TEST");
  const mode: "TEST" | "PRODUCTION" = isTestAppId ? "TEST" : "PRODUCTION";

  const endpoint = mode === "PRODUCTION" 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";

  return { mode, appId, secretKey, endpoint };
}

export async function checkAndStoreEnvironment(db: Firestore): Promise<CashfreeEnvInfo> {
  try {
     const config = validateCashfreeConfig();
     
     console.log("=== Cashfree Environment Check ===");
     console.log(`Mode: ${config.mode}`);
     console.log(`Endpoint: ${config.endpoint}`);
     console.log(`Credential: ${config.mode}`);
     console.log(`Status: VALID`);
     console.log("==================================");

     // Store in Firebase
     await setDoc(doc(db, "systemConfig", "cashfree"), {
        paymentMode: config.mode,
        lastValidation: new Date().toISOString(),
        environmentHealth: "healthy",
        activeEndpoint: config.endpoint
     });

     return config;
  } catch (error: any) {
     console.log("=== Cashfree Environment Check ===");
     console.error(error.message);
     console.error("Status: INVALID");
     console.log("==================================");
     
     // Make best effort to log the failure in Firebase
     try {
       await setDoc(doc(db, "systemConfig", "cashfree"), {
          paymentMode: process.env.CASHFREE_MODE || "unknown",
          lastValidation: new Date().toISOString(),
          environmentHealth: "invalid",
          error: error.message
       });
     } catch(e) {}
     
     // Rethrow to stop application initialization
     throw error;
  }
}

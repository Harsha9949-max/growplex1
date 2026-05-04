import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import { MOCK_SERVICES } from "./src/data/mockServices.js";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seedServices() {
  console.log("Adding mock services...");
  let count = 0;
  for (const service of MOCK_SERVICES) {
    if(!service.id) {
       console.log("Skipping service without id");
       continue;
    }
    const serviceRef = doc(db, "services", service.id);
    await setDoc(serviceRef, {
      name: service.name,
      category: service.category,
      packages: service.packages,
      description: service.description || '',
      deliveryTime: service.deliveryTime || ''
    });
    count++;
  }
  console.log(`Added ${count} services.`);
  process.exit(0);
}
seedServices().catch(console.error);


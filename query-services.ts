import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  console.log("Fetching services collection...");
  const snapshot = await getDocs(collection(db, "services"));
  const services: any[] = [];
  snapshot.forEach(doc => {
    services.push({ id: doc.id, ...doc.data() });
  });
  console.log("SERVICES IN DB:");
  services.forEach(s => {
    console.log(`- Service Document ID: "${s.id}" | Name: "${s.serviceName || s.name}" | Type: "${s.type}"`);
    console.log(`  smmServiceId: "${s.smmServiceId}"`);
    console.log(`  baseRateUsd: ${s.baseRateUsd}`);
    console.log(`  marginPercentage: ${s.marginPercentage}`);
    console.log(`  packages count: ${s.packages?.length}`);
    if (s.packages && s.packages.length > 0) {
      console.log(`  First package details:`, s.packages[0]);
    }
  });
}

run().catch(console.error);

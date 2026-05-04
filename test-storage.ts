import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const testRef = ref(storage, 'test.txt');

async function test() {
  try {
    await uploadString(testRef, 'hello');
    const url = await getDownloadURL(testRef);
    console.log('Success!', url);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();

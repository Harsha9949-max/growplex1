import fetch from "node-fetch";
async function test() {
  const url = "https://firestore.googleapis.com/v1/projects/educantpro1/databases/ai-studio-2517a055-ba39-4325-adaa-13bf1adca537/documents/system/settings";
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.fields?.telegramChatId?.stringValue);
}
test();

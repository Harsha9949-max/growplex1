import fetch from "node-fetch";

async function run() {
  const res = await fetch("http://localhost:3000/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 100, currency: "INR" })
  });
  console.log(res.status, await res.text());
}
run();

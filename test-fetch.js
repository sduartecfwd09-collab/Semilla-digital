async function test() {
  try {
    const res = await fetch('http://localhost:3002/productos');
    const text = await res.text();
    console.log("HTTP STATUS:", res.status);
    console.log("RESPONSE HEADERS:", res.headers);
    console.log("RESPONSE BODY TYPE:", typeof text);
    console.log("RESPONSE LENGTH:", text.length);
    console.log("FIRST 500 CHARS:", text.substring(0, 500));
  } catch (err) {
    console.error("Error fetching:", err);
  }
}
test();

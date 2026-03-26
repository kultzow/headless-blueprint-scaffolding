export async function generateImage(prompt='',size='') {
  console.log('generating image for prompt: '+prompt);
  try {
    const res = await fetch(`${process.env.API_MARKET_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-market-key": `${process.env.X_API_MARKET_KEY}`
      },
      body: JSON.stringify({
        model: "seedream-3-0-t2i-250415",
        prompt: prompt,
        response_format:'b64_json',
        size: size,
        watermark: false,
        guidance_scale: 2.5
      })
    });

    const result = await res.json();

    if (result.data[0].b64_json) {
      return(result.data[0].b64_json);
    } else {
      return('filtered');
    }
  } catch (err) {
    console.error("Error:", err);
  } 
}
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, cardData, face, prompt, awsID, sourceImageURL, size } = req.body;

  if (action === 'fetchPrompt') {
    const { fetchPrompt } = await import('@/components/card-related/CardFunctions');
    const result = await fetchPrompt(cardData, face, sourceImageURL);
    return res.json({ result });
  }

  if (action === 'previewCardArt') {
    const { previewCardArt } = await import('@/components/card-related/CardFunctions');
    const result = await previewCardArt(prompt, awsID, face, size);
    return res.json({ result });
  }

  if (action === 'replacePreview') {
    const { replacePreview } = await import('@/components/card-related/CardFunctions');
    await replacePreview(awsID, face);
    return res.json({ success: true });
  }

  if (action === 'generatePrintableCard') {
    const { generatePrintableCard } = await import('@/components/card-related/CardFunctions');
    await generatePrintableCard(awsID, face);
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Unknown action' });
}

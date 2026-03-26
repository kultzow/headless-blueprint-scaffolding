import type { NextApiRequest, NextApiResponse } from 'next';
import { prepareDeck, processBlock, finalizeDeck } from '@/components/pdf-related/handleGeneratePDF';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, deckID, blockIndex, imagePaths, totalBlocks } = req.body;

  try {
    if (action === 'prepare') {
      const result = await prepareDeck(deckID);
      return res.json(result);
    }
    if (action === 'processBlock') {
      const result = await processBlock(deckID, blockIndex, imagePaths);
      return res.json(result);
    }
    if (action === 'finalize') {
      const result = await finalizeDeck(deckID, totalBlocks);
      return res.json(result);
    }
    res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

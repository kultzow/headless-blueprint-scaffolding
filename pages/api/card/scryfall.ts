import type { NextApiRequest, NextApiResponse } from 'next';
import { getScryfallCardData } from '@/lib/scryfall';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { identifier } = req.query;
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ message: 'identifier is required' });
  }
  const data = await getScryfallCardData(identifier);
  res.json(data);
}

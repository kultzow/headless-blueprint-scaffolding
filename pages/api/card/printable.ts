import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrintableCard } from '@/components/card-related/CardFunctions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { awsID, face } = req.query;
  if (!awsID || typeof awsID !== 'string') {
    return res.status(400).json({ error: 'awsID is required' });
  }
  try {
    const url = await getPrintableCard(awsID, typeof face === 'string' ? face : 'front');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

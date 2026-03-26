'use server'
import { PDFDocument } from 'pdf-lib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { DeckMember } from '@/components/card-related/ScryfallDataTypes';
import { GetDeck } from '@/components/deck-related/DeckFunctions';

export type PrepareResult = {
  error: string | null;
  chunks: string[][];
  totalSheets: number;
  deckID: string;
};

export type BlockResult = {
  error: string | null;
};

export type FinalResult = {
  error: string | null;
  message: string;
  success: boolean;
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function prepareDeck(deckID: string): Promise<PrepareResult> {
  const modalArray = ['modal_dfc', 'transform', 'meld'];

  const list = await GetDeck(deckID);
  if (!list.length)
    return { error: `Deck #${deckID} not found.`, chunks: [], totalSheets: 0, deckID };
  const totalSheets = Math.ceil(list.length / 18);

  const token_tracker: DeckMember = { name: 'token_tracker', count: 1, awsID: '__token_tracker', layout: 'token' };
  while (list.length % 18 !== 0) list.push(token_tracker);

  const imagePaths: string[] = [];
  list.forEach((card) => {
    const myVariation = card.variation ?? '';
    imagePaths.push(`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_art/${card.awsID}-front${myVariation}.jpg`);
    let myBack = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_art/__card-back.jpg`;
    if (modalArray.includes(card.layout)) {
      myBack = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_art/${card.awsID}-back${myVariation}.jpg`;
    } else if (card.layout === 'token') {
      myBack = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_art/__token-back.jpg`;
    }
    imagePaths.push(myBack);
  });

  const chunks: string[][] = [];
  for (let i = 0; i < imagePaths.length; i += 36) chunks.push(imagePaths.slice(i, i + 36));

  return { error: null, chunks, totalSheets, deckID };
}

export async function processBlock(deckID: string, blockIndex: number, imagePaths: string[]): Promise<BlockResult> {
  try {
    const blockDoc = await PDFDocument.create();
    for (const imagePath of imagePaths) {
      const res = await fetch(imagePath);
      if (!res.ok) continue;
      const imgBytes = await res.arrayBuffer();
      const img = await blockDoc.embedJpg(imgBytes);
      const page = blockDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const blockBytes = await blockDoc.save();
    await writeFile(join(tmpdir(), `${deckID}-block-${blockIndex}.pdf`), blockBytes);
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function finalizeDeck(deckID: string, totalBlocks: number): Promise<FinalResult> {
  const tempPaths = Array.from({ length: totalBlocks }, (_, i) => join(tmpdir(), `${deckID}-block-${i}.pdf`));
  try {
    const finalDoc = await PDFDocument.create();
    for (const tempPath of tempPaths) {
      const bytes = await readFile(tempPath);
      const blockDoc = await PDFDocument.load(bytes);
      const pages = await finalDoc.copyPages(blockDoc, blockDoc.getPageIndices());
      pages.forEach(p => finalDoc.addPage(p));
    }

    const finalBytes = await finalDoc.save();
    const s3Key = `proofs/${deckID}.pdf`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
      Body: Buffer.from(finalBytes),
      ContentType: 'application/pdf',
    }));

    await Promise.all(tempPaths.map(p => unlink(p)));

    const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    return { error: null, message: `PDF generated: ${pdfUrl}`, success: true };
  } catch (error) {
    return { error: String(error), message: `Failed to finalize PDF: ${error}`, success: false };
  }
}

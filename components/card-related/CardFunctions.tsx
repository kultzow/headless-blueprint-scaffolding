'use server'
import { S3Client, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { generateImage } from  '@/lib/image-generation';
import { getPrompt } from  '@/lib/prompt-generation';
import { getScryfallCardData } from '@/lib/scryfall';
import { ScryfallCardData } from '@/components/card-related/ScryfallDataTypes';
import { awsID } from '@/components/card-related/CardParts';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(imageType = '', card_image:Buffer,awsID:string,face = '', append = '') {
  
  const key =   `${imageType}/${awsID}-${face}${append}.jpg`;
    await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: card_image,
    ContentType: 'image/jpeg',
    }));
}

/* ================ card image url (artwork) ================ */

export async function computeImageUrl(cardData: ScryfallCardData, face = 'front'): Promise<string> {
  const myAWS = awsID(cardData);
  const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/${myAWS}-${face}.jpg`;
  const res = await fetch(s3Url);
  if (res.status !== 200) {
    return getCardArt(cardData, face, '1024x1024');
  }
  return s3Url;
}

/* ================ the print-ready jpg of entire card ================ */

export async function getPrintableCard (identifier:string ='', face="front") {
const cardData = await(getScryfallCardData(identifier));
const myAWS = awsID(cardData);
const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_art/${myAWS}-${face}.jpg`;
const res = await fetch(s3Url);
if (res.status !== 200) {
  await generatePrintableCard(myAWS, face);
}
return s3Url;
}

export async function generatePrintableCard (awsID:string, face="front") {
// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = require('puppeteer') as typeof import('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({width: 1920, height: 1600});
await page.goto(`${baseUrl}/cards/${awsID}`, { waitUntil: 'networkidle0' });
const element = await page.$(`.preview-wrapper.${face} .card-container`);

// this should technically not be able to happen because this function shouldn't be called if awsID is invalid
if (!element) throw new Error(`Card not found: ${awsID}`);

const screenshot = await element.screenshot({ type: 'jpeg', quality: 100  });
await browser.close();
await uploadToS3('card_art',Buffer.from(screenshot), awsID, face);
return screenshot;
}


/* ================ the generated art  ================ */

export async function getCardArt (cardData:ScryfallCardData, face='front', size='') {
  console.log('getCardArt @ CardFunctions.tsx ======================================');
const faceIndex = face === 'back' ? 1 : 0;
  let sourceImageURL =  '';
if (cardData.card_faces?.[faceIndex]) {
    sourceImageURL = cardData.card_faces[faceIndex].image_uris!.art_crop;
} else {
    sourceImageURL = cardData.image_uris!.art_crop;
}
const myID = awsID(cardData);
const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/${myID}-${face}.jpg`;
const prompt = await getPrompt(cardData,face,sourceImageURL);
 if (prompt == 'filtered') {
    return  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/__filtered_openai.jpg`;
 } else {
    const seedreamResult =  await generateImage(prompt,size);
    if (seedreamResult === 'filtered') {
        return  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/__filtered_seedream.jpg`;
    } else {
        const image = Buffer.from(seedreamResult, 'base64');
        await uploadToS3('card_images',image, myID, face);
        return s3Url;
    }
 }
}

export async function fetchPrompt(cardData:ScryfallCardData,face='front',sourceImageURL: string) {
  return getPrompt(cardData,face,sourceImageURL);
}

export async function previewCardArt(prompt: string,awsID:string, face='', size='') {
  console.log (`at start of previewCardArt, awsID = ${awsID}`)
    const seedreamResult =  await generateImage(prompt,size);
    if (seedreamResult === 'filtered') {
        return  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/__filtered_seedream.jpg`;
    } else {
        const image = Buffer.from(seedreamResult, 'base64');
        await uploadToS3('card_images',image, awsID, face,'-preview');
        return  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/card_images/${awsID}-${face}-preview.jpg`;
    }
}

export async function replacePreview(awsID:string,face:string) {
    const copyParams = {
          Bucket: 'proxycards-ai-next',
          CopySource: `proxycards-ai-next/card_images/${awsID}-${face}-preview.jpg`, 
          Key: `card_images/${awsID}-${face}.jpg`,
        };
        try {
          await s3.send(new CopyObjectCommand(copyParams));
        } catch (err) {
          Error(`Failed to move object: ${err}`);
        }
}

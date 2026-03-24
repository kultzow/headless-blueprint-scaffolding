'use client'
import { useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScryfallCardData } from '@/components/card-related/ScryfallDataTypes';
import { awsID } from "@/components/card-related/CardParts";
import { fetchPrompt, previewCardArt, replacePreview, generatePrintableCard } from "@/components/card-related/CardFunctions";



interface CardAdminToolsProps {
    cardData:ScryfallCardData;
    face: string;
    onRefresh?: () => void;
    onClose?: () => void;
}



export function ImageTools({cardData, face, onRefresh, onClose}:CardAdminToolsProps) {

  const myID = awsID(cardData);
  const size = '1024x1024';
  const [prompt, setPrompt] = useState("");
  const [promptLoaded, setPromptLoaded] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareImages, setCompareImages] = useState<{ oldImage: string; newImage: string } | null>(null);

  const faceIndex = face === 'back' ? 1 : 0;
  let sourceImageURL =  '';
if (cardData.card_faces?.[faceIndex]) {
    sourceImageURL = cardData.card_faces[faceIndex].image_uris!.art_crop;
} else {
    sourceImageURL = cardData.image_uris!.art_crop;
}


  const handleGetPrompt = async () => {
    const result = await fetchPrompt(cardData,face,sourceImageURL);
    setPrompt(result ?? 'Error fetching prompt');
    setPromptLoaded(true);
  };

  const handleGetArt = async () => {
    const oldImage =  `https://proxycards-ai-next.s3.us-east-2.amazonaws.com/card_images/${myID}-${face}.jpg`
    const newImage = await previewCardArt(prompt,myID,face,size);
    confirmReplacement(oldImage,newImage);
  };

  const confirmReplacement = (oldImage: string, newImage: string) => {
    const bust = `?t=${Date.now()}`;
    setCompareImages({ oldImage: oldImage + bust, newImage: newImage + bust });
    setCompareOpen(true);
  };

  const handleReplacement = async () => {
    await replacePreview(myID,face);
    await generatePrintableCard(myID,face);
    onRefresh?.();
    onClose?.();
  };

  const handleRefreshPrint = async()=> {
      await generatePrintableCard(myID,face);
      onRefresh?.();
      onClose?.();
  }

      return (
        <div className="admin-card-tools">
            <div className="flex items-center justify-between gap-2">
            <Textarea placeholder="Get Prompt First" value={prompt} disabled={!promptLoaded} onChange={e => setPrompt(e.target.value)} />
            </div>
            <div className="flex items-center flex-wrap justify-between gap-2">
            <Button onClick={handleGetPrompt}>Get Prompt</Button>
            <Button onClick={handleGetArt} disabled={!promptLoaded}>Get Art</Button>
            <Button onClick={handleRefreshPrint}>Refresh Print File</Button>
            </div>

            <AlertDialog open={compareOpen} onOpenChange={setCompareOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Replace preview image?</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex gap-4 justify-center">
                  <div className="text-center">
                    <p className="text-sm mb-1">Current</p>
                    <Image src={compareImages?.oldImage ?? ''} alt="Current" width={200} height={200} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-1">New</p>
                    <Image src={compareImages?.newImage ?? ''} alt="New" width={200} height={200} />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="button" onClick={handleReplacement}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </div>
      );

}
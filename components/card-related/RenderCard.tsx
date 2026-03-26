import { ScryfallCardData } from '@/components/card-related/ScryfallDataTypes';
import { OracleText, ManaCost, TypeLine, CardName, CardImage, ModalIcon, ModalText, CardStats, OracleData } from '@/components/card-related/CardParts';
import { CardClasses } from '@/components/card-related/CardClasses';

interface CardProps {
  cardData: ScryfallCardData;
  face?: string;
  imageUrl?: string;
  oracleData?: OracleData;
}

export function RenderCard({ cardData, face = 'front', imageUrl = '', oracleData }: CardProps) {
  if (face === 'back' && !cardData.card_faces?.[1]) return null;
  return (
    <div className={`preview-wrapper ${face}`} scryfall-id={cardData.id} oracle-id={cardData.oracle_id}>
      <div className={CardClasses({ cardData })}>
        <div className="shadow-wrapper"></div>
        <CardImage imageUrl={imageUrl} face={face} />
        <ModalIcon cardData={cardData} />
        <div className="card-header">
          <CardName cardData={cardData} face={face} />
          <ManaCost cardData={cardData} face={face} />
        </div>
        <TypeLine cardData={cardData} face={face} />
        <div className="frame">
          <div className="frame-text-wrapper">
            <div className="frame-text-box">
              <div className="text">
                <OracleText oracleData={oracleData} />
                <ModalText cardData={cardData} face={face} />
              </div>
            </div>
          </div>
          <CardStats cardData={cardData} face={face} />
        </div>
        <div className="info"></div>
      </div>
    </div>
  );
}

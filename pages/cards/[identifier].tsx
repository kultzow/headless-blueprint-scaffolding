import { GetServerSideProps } from 'next';
import { RenderCard } from '@/components/card-related/RenderCard';
import { ScryfallCardData } from '@/components/card-related/ScryfallDataTypes';
import type { OracleData } from '@/components/card-related/CardParts';

interface Props {
  cardData: ScryfallCardData;
  frontImageUrl: string;
  backImageUrl: string;
  frontOracleData: OracleData | null;
  backOracleData: OracleData | null;
}

export default function SingleCardPage({ cardData, frontImageUrl, backImageUrl, frontOracleData, backOracleData }: Props) {
  return (
    <div className="admin-card-wrapper">
      <div className="proxy-card">
        <RenderCard cardData={cardData} face="front" imageUrl={frontImageUrl} oracleData={frontOracleData ?? undefined} />
      </div>
      <div className="proxy-card">
        <RenderCard cardData={cardData} face="back" imageUrl={backImageUrl} oracleData={backOracleData ?? undefined} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { getScryfallCardData } = await import('@/lib/scryfall');
  const { computeImageUrl } = await import('@/components/card-related/CardFunctions');
  const { computeOracleHtml } = await import('@/components/card-related/CardParts');

  const identifier = params?.identifier as string;
  const cardData = await getScryfallCardData(identifier);
  if (!cardData || 'message' in cardData) return { notFound: true };

  const hasTwoFaces = !!cardData.card_faces?.[1];
  const [frontImageUrl, backImageUrl, frontOracleData, backOracleData] = await Promise.all([
    computeImageUrl(cardData, 'front'),
    hasTwoFaces ? computeImageUrl(cardData, 'back') : Promise.resolve(''),
    computeOracleHtml(cardData, 'front'),
    hasTwoFaces ? computeOracleHtml(cardData, 'back') : Promise.resolve(null),
  ]);

  return {
    props: { cardData, frontImageUrl, backImageUrl, frontOracleData, backOracleData },
  };
};

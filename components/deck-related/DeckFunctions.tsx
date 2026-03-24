'use server'
import { db } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { DeckMember } from '@/components/card-related/ScryfallDataTypes';

interface DeckMeta extends RowDataPacket {
  meta_value: string;
}

export async function GetDeck(deck_id = '') {
    const [rows] = await db.execute<DeckMeta[]>(
    `SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = 'wpcf-card-list' LIMIT 1`,
    [deck_id]
  );
  if (!rows.length || !rows[0].meta_value) return [];
  return JSON.parse(rows[0].meta_value) as DeckMember[];
}

export async function updateCardList(deck_id: string, member: DeckMember) {
  const [rows] = await db.execute<DeckMeta[]>(
    `SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = 'wpcf-card-list' LIMIT 1`,
    [deck_id]
  );
  if (!rows.length) return;
  const list: DeckMember[] = JSON.parse(rows[0].meta_value);
  const updated = list.map(m => m.awsID === member.awsID ? member : m);
  await db.execute(
    `UPDATE wp_postmeta SET meta_value = ? WHERE post_id = ? AND meta_key = 'wpcf-card-list'`,
    [JSON.stringify(updated), deck_id]
  );
}


export async function emptyDeck({deckID}: {deckID:string}) {
await db.execute(
    `UPDATE wp_postmeta SET meta_value = '' WHERE post_id = ? AND meta_key = 'wpcf-card-list'`,
     [deckID]
  );
return;
}

export async function removeCardFromDeck(deck_id: string, member: DeckMember) {
  
  const [rows] = await db.execute<DeckMeta[]>(
    `SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = 'wpcf-card-list' LIMIT 1`,
    [deck_id]
  );
  if (!rows.length) return;
  const list: DeckMember[] = JSON.parse(rows[0].meta_value);
  const updated = list.filter(m => m.awsID !== member.awsID);
  await db.execute(
    `UPDATE wp_postmeta SET meta_value = ? WHERE post_id = ? AND meta_key = 'wpcf-card-list'`,
    [JSON.stringify(updated), deck_id]
  );
}

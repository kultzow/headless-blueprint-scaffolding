import {ScryfallCardData} from '@/components/card-related/ScryfallDataTypes';

interface CardClassesProps {
    oracle_text?: string;
    layout?: string;
    name: string;
    mana_cost: string;
    type_line: string;
    colors?:string[];
}

// this general interface is used by many things
interface CardProps {
    cardData: ScryfallCardData,
    face?: string
}



export function CardClasses({cardData, face = ''}:CardProps) {
const faceIndex = face === 'back' ? 1 : 0;
 if (cardData.card_faces?.[faceIndex]) {
   const oracle_text = cardData.card_faces?.[faceIndex].oracle_text;
   const layout = cardData.card_faces?.[faceIndex].layout;
   const name = cardData.card_faces?.[faceIndex].name;
   const mana_cost = cardData.card_faces?.[faceIndex].mana_cost;
   const type_line = cardData.card_faces?.[faceIndex].type_line;
   const colors = cardData.card_faces?.[faceIndex].colors;
   return FormatCardClasses({oracle_text: oracle_text, layout: layout,name: name,mana_cost: mana_cost, type_line:type_line,  colors:colors});
} else {
    const oracle_text = cardData.oracle_text;
   const layout = cardData.layout;
   const name = cardData.name;
   const mana_cost = cardData.mana_cost;
   const type_line = cardData.type_line;
   const colors = cardData.colors;
   return FormatCardClasses({oracle_text: oracle_text, layout: layout,name: name,mana_cost: mana_cost, type_line:type_line,  colors:colors});
}
}

function FormatCardClasses({oracle_text = '', layout = '',name,mana_cost, type_line,  colors= []}: CardClassesProps) {

const dualLands = ['Tundra','Underground Sea','Savannah','Scrubland','Tropical Island','Volcanic Island','Plateau','Badlands','Bayou','Taiga'];
const snowLands = ['Snow-Covered Island','Snow-Covered Forest','Snow-Covered Swamp','Snow-Covered Plains','Snow-Covered Mountain'];
const basicLands = ['Island','Forest','Swamp','Plains','Mountain'];

let classes = 'card-container';
let colorClass = ' color-';

switch (colors.length) {
    case 0: colorClass += 'colorless'; break;
    case 1: colorClass += colors[0].toLowerCase(); break;
    default: colorClass += 'gold'; break;
}

if (!colors.length && type_line.includes('Artifact')) {
    colorClass = ' color-artifact';
}

if (type_line.includes('Snow')) {
    colorClass += ' snow';
}

if (type_line.includes('Enchant')) {
    colorClass += ' enchant';
}

// the following is correct; if it's a snow land, we want to remove color class so far

if (type_line.includes('Snow Land')) {
    colorClass = ' snow-land';
}

classes += colorClass;

let layoutClass = layout;

if (layout == 'normal' && !oracle_text ){
    layoutClass = 'normal tall-art';
}

if (dualLands.includes(name) || snowLands.includes(name)){
    layoutClass = 'land tall-art';
}

if (basicLands.includes(name)){
    layoutClass = 'basic-land land tall-art';
}

if (layout == 'token' && !oracle_text){
    layoutClass = 'token tall-art';
}

if (layout == 'double_faced_token' && !oracle_text){
    layoutClass = 'double_faced_token tall-art';
}

// special exception

if (name.includes('Ring Tempts You')) {
    layoutClass = 'planeswalker';
}


if (layout == 'token' && mana_cost){
    layoutClass = '';
}

classes += ' '+layoutClass;

if (type_line=="Card"){
    classes +=  ' generic-card';
}

if (layout == 'leveler') {
    classes += ' leveler';
}

if (type_line.includes('Class')) {
    classes += ' class';
}

if (oracle_text.includes('Station')) {
    classes += ' station';
}

if (type_line.includes('Legendary')) {
    classes += ' legendary';
}

if (type_line.includes('Planeswalker')) {
    classes += ' planeswalker';
}

if (type_line.includes('Saga')) {
    classes += ' saga';
}

return (classes);
}



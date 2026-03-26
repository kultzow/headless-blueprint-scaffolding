import React from 'react';
import {getFontSizeToFit} from '@/components/card-related/CardFontsize';
import {ScryfallCardData} from '@/components/card-related/ScryfallDataTypes';

// this general interface is used by many things
interface CardProps {
    cardData: ScryfallCardData,
    face?: string
}


export  function awsID(cardData:ScryfallCardData):string {
  if (cardData.flavor_name || cardData.printed_name) {
    return cardData.id;
  }
  else {
    return cardData.oracle_id;
  }
}

export type OracleData = { html: string; fontSize: number; magnification: string };

export async function computeOracleHtml(cardData: ScryfallCardData, face = ''): Promise<OracleData> {
  const faceIndex = face === 'back' ? 1 : 0;
  let sourceText: string, layout: string, type_line: string;
  if (cardData.card_faces?.[0]) {
    sourceText = cardData.card_faces[faceIndex].oracle_text;
    layout = cardData.card_faces[faceIndex].layout;
    type_line = cardData.card_faces[faceIndex].printed_type_line ?? cardData.card_faces[faceIndex].type_line;
  } else {
    sourceText = cardData.oracle_text;
    layout = cardData.layout;
    type_line = cardData.printed_type_line ?? cardData.type_line;
  }
  return FormatOracleText({ sourceText, layout, type_line });
}

export function OracleText({ oracleData }: { oracleData?: OracleData }) {
  if (!oracleData) return null;
  return <div className={oracleData.magnification} style={{ fontSize: oracleData.fontSize }} dangerouslySetInnerHTML={{ __html: oracleData.html }} />;
}

export function ModalIcon({cardData}:CardProps) {
 if (cardData.card_faces?.[0]) {
return <i className="ms two-sided ms-dfc-modal-face ms-3x"></i>;
} else {
return;
}
}


export function ModalText({cardData, face = ''}:CardProps) {
// this is reversed because we want opposite side's type line
const faceIndex = face === 'back' ? 0 : 1;
if (cardData.layout == 'modal_dfc' && cardData.card_faces?.[0]) {
    let filteredType = cardData.card_faces?.[faceIndex].printed_type_line ? cardData.card_faces?.[faceIndex].printed_type_line : cardData.card_faces?.[faceIndex].type_line;
     filteredType = filteredType.replace(/\—(.*)/g,'');
    const modal_text = `↫ ${filteredType} ${cardData.card_faces?.[faceIndex].mana_cost}`;
    const markup = { __html: ReplaceSymbols(modal_text) };

    return <p className="modal-text" dangerouslySetInnerHTML={markup} />;
} else {
return;
}
}

export function CardStats({cardData, face = ''}:CardProps) {
const faceIndex = face === 'back' ? 1 : 0;

 if (cardData.card_faces?.[0]) {
    if  (cardData.card_faces[faceIndex].defense) {
        return <div className="stats defense-stats">{cardData.card_faces[faceIndex].defense}</div>
    } else if  (cardData.card_faces[faceIndex].loyalty) {
        return <div className="stats planeswalker-stats">{cardData.card_faces[faceIndex].loyalty}</div>
    } else if  (cardData.card_faces[faceIndex].power || cardData.card_faces[faceIndex].toughness) {
        const powerClass = cardData.card_faces[faceIndex].power === '*' ? "power offset" : "power";
        const toughnessClass = cardData.card_faces[faceIndex].toughness === '*' ? "toughness offset" : "toughness";
        return <div className="stats"><span className={powerClass}>{cardData.card_faces[faceIndex].power}</span>/<span className={toughnessClass}>{cardData.card_faces[faceIndex].toughness}</span></div>;
    }
  
 }
else { 
    if  (cardData.defense) {
        return <div className="stats defense-stats">{cardData.defense}</div>
    } else if  (cardData.loyalty) {
        //exception for dungeon master
        if (cardData.loyalty === '1d4+1') {
		return <div className="stats planeswalker-stats dungeon-master"><span>d4<br/>+1</span></div>
        }
        else {
            return <div className="stats planeswalker-stats">{cardData.loyalty}</div>
        }
            
    } else if  (cardData.power || cardData.toughness) {
        const powerClass = cardData.power === '*' ? "power offset" : "power";
        const tougnessClass = cardData.toughness === '*' ? "toughness offset" : "toughness";
return   <div className="stats"><span className={powerClass}>{cardData.power}</span>/<span className={tougnessClass}>{cardData.toughness}</span></div>;
    }
}
}


export function CardImage({ imageUrl, face = 'front' }: { imageUrl: string; face?: string }) {
  return <div className={`card-image ${face}`} style={{ backgroundImage: `url(${imageUrl})` }} />;
}

export function CardName({cardData, face = ''}:CardProps) {
    const faceIndex = face === 'back' ? 1 : 0;

 if (cardData.card_faces?.[0]) {
    
    const cardFace = cardData.card_faces![faceIndex];
    if (cardFace.printed_name || cardFace.flavor_name) {
        return <div className='name inset flavored'>{ DisplayName({cardData,face})}<br/><em>{cardFace.name}</em></div>;
    }
    else {
        return <div className='name inset'>{ DisplayName({cardData,face})}</div>;
    }

    
}
if (cardData.printed_name || cardData.flavor_name) {
        return <div className='name flavored'>{ DisplayName({cardData})}<br/><em>{cardData.name}</em></div>;
    }
    else {
        return <div className='name'>{ DisplayName({cardData})}</div>;
    }
}


export function DisplayName({cardData, face = ''}:CardProps) {
const faceIndex = face === 'back' ? 1 : 0;

 if (cardData.card_faces?.[0]) {
    const cardFace = cardData.card_faces![faceIndex];
    return cardFace.printed_name || cardFace.flavor_name || cardFace.name; 
}
else {
  return cardData.printed_name || cardData.flavor_name || cardData.name; 
}
}

export function ManaCost({cardData, face = ''}:CardProps) {
const faceIndex = face === 'back' ? 1 : 0;
let mana_cost = '';

if (cardData.card_faces?.[0]) {
mana_cost = cardData.card_faces[faceIndex].mana_cost;
} else {
mana_cost = cardData.mana_cost;
}

const markup = { __html: ReplaceSymbols(mana_cost) };
return <div className="mana-costs" dangerouslySetInnerHTML={markup} />;
}

export function DisplayType({cardData, face = ''}:CardProps) {
    const faceIndex = face === 'back' ? 1 : 0;
    let type_line = cardData.type_line;

    if (cardData.card_faces?.[0]) {
        if (cardData.card_faces[faceIndex].printed_type_line) {
            type_line = cardData.card_faces[faceIndex].printed_type_line;
        } else {
            type_line = cardData.card_faces[faceIndex].type_line;
        }
    }
    else {
        if (cardData.printed_type_line) {
            type_line = cardData.printed_type_line;
        } else {
            type_line = cardData.type_line;
        }
    }


return type_line;
}

export function TypeLine({cardData, face = ''}:CardProps) {
    const type_line = DisplayType({cardData, face});

const markup = { __html: type_line };

return <div className="type-line"><div className="type" dangerouslySetInnerHTML={markup} /></div>;
}

async function FormatOracleText({sourceText = '', layout = '', type_line = ''}) {

let result = sourceText;

//result = RemoveExplanations(result);
// remove all explanations 
result = result.replaceAll(/ ?\((.*?)\)/g,  '');

const magnification = result.length < 40 ? 'magnify' : '';


let boxWidth = 545;
let boxHeight = 325;

if (type_line.includes("Saga") || type_line.includes("Planeswalker")) {
boxWidth = 545;
boxHeight = 465;
}
if (type_line.includes("Token")) {
boxWidth = 545;
boxHeight = 175;
}

const bestFontSize = await getFontSizeToFit(result, boxWidth, boxHeight, 'css/fonts/roboto-slab.ttf');

result = result.replaceAll(/\((.*?)\)/g,  '(<em>$1</em>)');
result = result.replaceAll(/(-[A-Z0-9]*\/-[A-Z0-9])/g,  '<span class="nowrap">$1</span>');
result = result.replaceAll(/(\+[A-Z0-9]\/\+[A-Z0-9])/g,  '<span class="nowrap">$1</span>');
result = result.replaceAll(/(<i class="(.*?)"><\/i>)+/g,  '<span class="nowrap">$1</span>');
result = result.replaceAll('}: ', '} ');

result = ReplaceSymbols(result);

const renderRules = (text: string): string => {
return text
    .split(/\r\n|\r|\n|\\n/)
    .map((rule) => `<p>${rule}</p>`)
    .join("");
};

let renderedRules = renderRules(result)

renderedRules = GeneralReplacements(renderedRules);

if(layout == 'leveler') {
    renderedRules = OptimizeLevelers(renderedRules);
}


if (type_line.includes("Class")) {
renderedRules = renderedRules.replace('Level 2','<span class="nowrap">Level 2</span>')
renderedRules = renderedRules.replace('Level 3','<span class="nowrap">Level 3</span>')
}

// sagas don't necessarily have the saga layout because wizards are great
renderedRules = OptimizeSagas(renderedRules);

if (sourceText.includes('Station')) {
 renderedRules = OptimizeStations(renderedRules);
}

renderedRules = renderedRules.replace('<p></p>','')

return { html: renderedRules, fontSize: bestFontSize, magnification };
}

function OptimizeSagas(renderedRules:string) {

// single sagas
renderedRules = renderedRules.replaceAll('<p>VI —','<div class="saga-levels"><div class="saga-level">VI</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>V —','<div class="saga-levels"><div class="saga-level">V</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>IV —','<div class="saga-levels"><div class="saga-level">IV</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>III —','<div class="saga-levels"><div class="saga-level">III</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>II —','<div class="saga-levels"><div class="saga-level">II</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>I —','<div class="saga-levels"><div class="saga-level">I</div></div><p>');

// grouped sagas
renderedRules = renderedRules.replaceAll('<p>I, II, III, IV, V, VI —','<div class="saga-levels"><div class="saga-level">I</div><div class="saga-separator">~</div><div class="saga-level">VI</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>II, III, IV, V, VI —','<div class="saga-levels"><div class="saga-level">II</div><div class="saga-separator">~</div><div class="saga-level">VI</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>II, III, IV, V —','<div class="saga-levels"><div class="saga-level">II</div><div class="saga-separator">~</div><div class="saga-level">V</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>II, IV —','<div class="saga-levels"><div class="saga-level">II</div><div class="saga-level">IV</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>I, III —','<div class="saga-levels"><div class="saga-level">I</div><div class="saga-level">III</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>I, II, III —','<div class="saga-levels"><div class="saga-level">I</div><div class="saga-level">II</div><div class="saga-level">III</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>II, III —','<div class="saga-levels"><div class="saga-level">II</div><div class="saga-level">III</div></div><p>');
renderedRules = renderedRules.replaceAll('<p>I, II —','<div class="saga-levels"><div class="saga-level">I</div><div class="saga-level">II</div></div><p>');

return(renderedRules)

}

function OptimizeStations(renderedRules:string) {

const paragraphRegex = /<p[^>]*>(.*?)<\/p>/g;
  const matches = [...renderedRules.matchAll(paragraphRegex)];
  const count = matches.length;

  const ps:string[] = [];;
  let stationIndex = 0;

  for (let i = 0; i < count; i++) {
    let tempString = matches[i][0];

    // Remove station italics
    if (tempString.includes('Station <em>')) {
      tempString = '<p>Station</p>';
    }

    const statsMatches = [...tempString.matchAll(/<p>\d+\/\d+<\/p>/g)];

    if (tempString.includes('STATION')) {
      tempString = tempString.replace('<p>STATION ', '<p class="population">');
      tempString = tempString.replace('<p', '<div class="station-level"><p');
      stationIndex++;

      if (stationIndex > 1) {
        ps[i - 1] = ps[i - 1].replace('</p>', '</p></div>');
      }
    } else if (statsMatches.length > 0) {
      tempString = tempString.replace('<p>', '<p class="stats">');
    } else {
      tempString = tempString.replace('<p>', '<p class="ability">');
    }

    if (i === count - 1) {
      tempString = tempString.replace('</p>', '</p></div>');
    }

    ps.push(tempString);
  }

  return ps.join('');

return(renderedRules)

}

function OptimizeLevelers(renderedRules:string) {

renderedRules = renderedRules.replaceAll('LEVEL ',' ');
 // if there's no ability on level 2, insert empty <p> tags

const pCount = (renderedRules.match(/<p>/g) || []).length;

if (pCount === 6) {
    const exploded = renderedRules.split("</p>");
    exploded.splice(3, 0, "<p>&nbsp;");
    renderedRules = exploded.join("</p>");
}

  // if there's two abilities on level 3, combine the last two tags
if (pCount === 8) {
    const exploded = renderedRules.split("</p>");
    const last1 = exploded[7].substring(3);
    const last2 = exploded[6] + "<br/>" + last1;
    exploded.pop();
    exploded.pop();
    exploded[6] = last2;
    renderedRules = exploded.join("</p>");
}

return(renderedRules)

}

function GeneralReplacements(renderedRules:string) {

renderedRules = renderedRules.replaceAll('<p>//Level_2//</p>', '');
renderedRules = renderedRules.replaceAll('<p>//Level_3//</p>', '');
{/* there were unicode mystery rules here that i don't know what they were */}

renderedRules = renderedRules.replaceAll('TKTKTKTKTK', '<span class="ticket-count">5</span> <span class="ticket">🎫︎</span>');
renderedRules = renderedRules.replaceAll('TKTKTKTK', '<span class="ticket-count">4</span> <span class="ticket">🎫︎</span>');
renderedRules = renderedRules.replaceAll('TKTKTK', '<span class="ticket-count">3</span> <span class="ticket">🎫︎</span>');
renderedRules = renderedRules.replaceAll('TKTK', '<span class="ticket-count">2</span> <span class="ticket">🎫︎</span>');
renderedRules = renderedRules.replaceAll('TK', '<span class="ticket-count">1</span> <span class="ticket">🎫︎</span>');

return(renderedRules)

}

function ReplaceSymbols(sourceText:string) {

let result = sourceText;

result = result.replaceAll(/{W}/g, '<i class="ms ms-w ms-cost"></i>');
result = result.replaceAll(/{U}/g, '<i class="ms ms-u ms-cost"></i>');
result = result.replaceAll(/{B}/g, '<i class="ms ms-b ms-cost "></i>');
result = result.replaceAll(/{R}/g, '<i class="ms ms-r ms-cost "></i>');
result = result.replaceAll(/{G}/g, '<i class="ms ms-g ms-cost "></i>');

result = result.replaceAll(/{C}/g, '<i class="ms ms-c ms-cost "></i>');
result = result.replaceAll(/{SNOW}/g, '<i class="ms ms-snow "></i>');
result = result.replaceAll(/{S}/g, '<i class="ms ms-s "></i>');

result = result.replaceAll(/\{(\d+)\}/g, '<i class="ms ms-$1 ms-cost "></i>');

result = result.replaceAll(/{X}/g, '<i class="ms ms-x ms-cost "></i>');
result = result.replaceAll(/{Y}/g, '<i class="ms ms-y ms-cost "></i>');
result = result.replaceAll(/{Z}/g, '<i class="ms ms-z ms-cost "></i>');

result = result.replaceAll(/{E}/g, '<i class="ms ms-e ms-cost "></i>');

result = result.replaceAll(/{T}/g, '<i class="ms ms-tap ms-cost "></i>');
result = result.replaceAll(/{Q}/g, '<i class="ms ms-untap ms-cost "></i>');

result = result.replaceAll(/{2\/W}/g, '<i class="ms ms-2w ms-cost "></i>');
result = result.replaceAll(/{2\/U}/g, '<i class="ms ms-2u ms-cost "></i>');
result = result.replaceAll(/{2\/R}/g, '<i class="ms ms-2r ms-cost "></i>');
result = result.replaceAll(/{2\/B}/g, '<i class="ms ms-2b ms-cost "></i>');
result = result.replaceAll(/{2\/G}/g, '<i class="ms ms-2g ms-cost "></i>');

result = result.replaceAll(/{C\/W}/g, '<i class="ms ms-cw ms-cost "></i>');
result = result.replaceAll(/{C\/U}/g, '<i class="ms ms-cu ms-cost "></i>');
result = result.replaceAll(/{C\/R}/g, '<i class="ms ms-cr ms-cost "></i>');
result = result.replaceAll(/{C\/B}/g, '<i class="ms ms-cb ms-cost "></i>');
result = result.replaceAll(/{C\/G}/g, '<i class="ms ms-cg ms-cost "></i>');

result = result.replaceAll(/{W\/U}/g, '<i class="ms ms-wu ms-cost "></i>');
result = result.replaceAll(/{W\/B}/g, '<i class="ms ms-wb ms-cost "></i>');
result = result.replaceAll(/{U\/B}/g, '<i class="ms ms-ub ms-cost "></i>');
result = result.replaceAll(/{U\/R}/g, '<i class="ms ms-ur ms-cost "></i>');
result = result.replaceAll(/{B\/R}/g, '<i class="ms ms-br ms-cost "></i>');
result = result.replaceAll(/{B\/G}/g, '<i class="ms ms-bg ms-cost "></i>');
result = result.replaceAll(/{R\/W}/g, '<i class="ms ms-rw ms-cost "></i>');
result = result.replaceAll(/{R\/G}/g, '<i class="ms ms-rg ms-cost "></i>');
result = result.replaceAll(/{G\/W}/g, '<i class="ms ms-gw ms-cost "></i>');
result = result.replaceAll(/{G\/U}/g, '<i class="ms ms-gu ms-cost "></i>');

result = result.replaceAll(/{P}/g, '<i class="ms ms-p ms-cost"></i>');

result = result.replaceAll(/{W\/U\/P}/g, '<i class="ms ms-wu ms-p ms-cost "></i>');
result = result.replaceAll(/{W\/B\/P}/g, '<i class="ms ms-wb ms-p ms-cost "></i>');
result = result.replaceAll(/{U\/B\/P}/g, '<i class="ms ms-ub ms-p ms-cost "></i>');
result = result.replaceAll(/{U\/R\/P}/g, '<i class="ms ms-ur ms-p ms-cost "></i>');
result = result.replaceAll(/{B\/R\/P}/g, '<i class="ms ms-br ms-p ms-cost "></i>');
result = result.replaceAll(/{B\/G\/P}/g, '<i class="ms ms-bg ms-p ms-cost "></i>');
result = result.replaceAll(/{R\/W\/P}/g, '<i class="ms ms-rw ms-p ms-cost "></i>');
result = result.replaceAll(/{R\/G\/P}/g, '<i class="ms ms-rg ms-p ms-cost "></i>');
result = result.replaceAll(/{G\/W\/P}/g, '<i class="ms ms-gw ms-p ms-cost "></i>');
result = result.replaceAll(/{G\/U\/P}/g, '<i class="ms ms-gu ms-p ms-cost "></i>');

result = result.replaceAll(/{W\/P}/g, '<i class="ms ms-wp ms-cost "></i>');
result = result.replaceAll(/{U\/P}/g, '<i class="ms ms-up ms-cost "></i>');
result = result.replaceAll(/{R\/P}/g, '<i class="ms ms-rp ms-cost "></i>');
result = result.replaceAll(/{B\/P}/g, '<i class="ms ms-bp ms-cost "></i>');
result = result.replaceAll(/{G\/P}/g, '<i class="ms ms-gp ms-cost "></i>');

result = result.replaceAll(/\+1:/g, '<span class="loyalty up">+1</span>');
result = result.replaceAll(/\+2:/g, '<span class="loyalty up">+2</span>');
result = result.replaceAll(/\+3:/g, '<span class="loyalty up">+3</span>');
result = result.replaceAll(/\+4:/g, '<span class="loyalty up">+4</span>');
result = result.replaceAll(/\+5:/g, '<span class="loyalty up">5</span>');
result = result.replaceAll(/\+6:/g, '<span class="loyalty up">+6</span>');
result = result.replaceAll(/\+7:/g, '<span class="loyalty up">+7</span>');
result = result.replaceAll(/\+8:/g, '<span class="loyalty up">+8</span>');
result = result.replaceAll(/\+9:/g, '<span class="loyalty up">+9</span>');
result = result.replaceAll(/\+10:/g, '<span class="loyalty up">+10</span>');
result = result.replaceAll(/\+11:/g, '<span class="loyalty up">+11</span>');
result = result.replaceAll(/\+12:/g, '<span class="loyalty up">+12</span>');
result = result.replaceAll(/\+13:/g, '<span class="loyalty up">+13</span>');
result = result.replaceAll(/\+14:/g, '<span class="loyalty up">+14</span>');
result = result.replaceAll(/\+15:/g, '<span class="loyalty up">+15</span>');
result = result.replaceAll(/\+16:/g, '<span class="loyalty up">+16</span>');
result = result.replaceAll(/\+17:/g, '<span class="loyalty up">+17</span>');
result = result.replaceAll(/\+18:/g, '<span class="loyalty up">+18</span>');
result = result.replaceAll(/\+19:/g, '<span class="loyalty up">+19</span>');
result = result.replaceAll(/\+20:/g, '<span class="loyalty up">+20</span>');

result = result.replaceAll(/−X:/g, '<span class="loyalty">-X</span>');

result = result.replaceAll(/−1:/g, '<span class="loyalty">-1</span>');
result = result.replaceAll(/−2:/g, '<span class="loyalty">-2</span>');
result = result.replaceAll(/−3:/g, '<span class="loyalty">-3</span>');
result = result.replaceAll(/−4:/g, '<span class="loyalty">-4</span>');
result = result.replaceAll(/−5:/g, '<span class="loyalty">-5</span>');
result = result.replaceAll(/−6:/g, '<span class="loyalty">-6</span>');
result = result.replaceAll(/−7:/g, '<span class="loyalty">-7</span>');
result = result.replaceAll(/−8:/g, '<span class="loyalty">-8</span>');
result = result.replaceAll(/−9:/g, '<span class="loyalty">-9</span>');
result = result.replaceAll(/−10:/g, '<span class="loyalty">-10</span>');
result = result.replaceAll(/−11:/g, '<span class="loyalty">-11</span>');
result = result.replaceAll(/−12:/g, '<span class="loyalty">-12</span>');
result = result.replaceAll(/−13:/g, '<span class="loyalty">-13</span>');
result = result.replaceAll(/−14:/g, '<span class="loyalty">-14</span>');
result = result.replaceAll(/−15:/g, '<span class="loyalty">-15</span>');
result = result.replaceAll(/−16:/g, '<span class="loyalty">-16</span>');
result = result.replaceAll(/−17:/g, '<span class="loyalty">-17</span>');
result = result.replaceAll(/−18:/g, '<span class="loyalty">-18</span>');
result = result.replaceAll(/−19:/g, '<span class="loyalty">-19</span>');
result = result.replaceAll(/−20:/g, '<span class="loyalty">-20</span>');

result = result.replaceAll(/0:/g, '<span class="loyalty up">0</span>');

result = result.replaceAll('{','');
result = result.replaceAll('}','');

return(result);
}

export async function getScryfallSets(code: string = '') {
  
  const res = await fetch('https://api.scryfall.com/sets/'+code);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}


export async function getScryfallCardsBySet(code: string = '') {
    const res = await fetch('https://api.scryfall.com/cards/search?include_extras=false&include_variations=false&order=set&q=e%3A'+code+'+-is%3Areprint+unique%3Acards&unique=cards'); 
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

   const data = await res.json();
  
  if (!data.has_more) return data;
  let allData = [...data.data];
  let nextPage = data.next_page;

  while (nextPage) {
    const nextRes = await fetch(nextPage);
    if (!nextRes.ok) throw new Error('Failed to fetch data');
    
    const nextData = await nextRes.json();
    allData = [...allData, ...nextData.data];
    nextPage = nextData.has_more ? nextData.next_page : null;
  }

  return { ...data, data: allData };
}



export async function getScryfallCardData(identifier: string = '') {
 await new Promise(resolve => setTimeout(resolve, 100));
 const hasFourDashes = (str: string) => str.split("-").length - 1 === 4;
   if (hasFourDashes(identifier)) {
    const scryfallJSON = await getScryfallCardByID(identifier);
     return scryfallJSON;
   } else {
    const scryfallJSON = await getScryfallCardByName(identifier);
     return scryfallJSON;
   }
}


async function getScryfallCardByID(id: string = '') {
    const res = await fetch('https://api.scryfall.com/cards/search?prefer=oldest&q=lang%3Aen+oracleid%3A'+id);
      if (!res.ok) {
        const res2 = await fetch('https://api.scryfall.com/cards/'+id);
        if (!res2.ok) {
          return { message: 'ID not found.' }
        }
        const result2 = await res2.json();
        return result2;
     }
    const result = await res.json();
    return result.data[0];
}

async function getScryfallCardByName(name: string = '') {
    const res = await fetch('https://api.scryfall.com/cards/named?exact='+name);
  if (!res.ok) {
    return { message: 'Scryfall could not find a card named '+name+'. Make sure you have the correct spelling and punctuation.' }
  }
const result = await res.json();
return result;
}
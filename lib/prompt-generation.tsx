import { ScryfallCardData } from "@/components/card-related/ScryfallDataTypes";
import { DisplayName, DisplayType } from "@/components/card-related/CardParts";

export async function  getPrompt(cardData:ScryfallCardData, face='front', sourceImageURL='') {
    const messages = [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image? Ignore any text in the image when answering this question. Be descriptive about the details."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": sourceImageURL,
              "detail": "low"
            }
          }
        ]
      }
    ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages
      })
    });

    const data = await res.json();

    console.log(data);

    if (data?.choices?.[0]?.message?.content) {
      return(formatPrompt(cardData, face, data.choices[0].message.content));
    } else {
      return('filtered');
    }
  } catch (err) {
    console.error("Error:", err);
  } 
}

function formatPrompt (cardData:ScryfallCardData, face='front', prompt:string) {

    const typeLine = DisplayType({cardData,face});
    const title = formatTitle(DisplayName({cardData,face}));
    const description = formatDescription(typeLine);
    let formattedPrompt = 'No text, no logos. Avoid or reduce symmetry - composition should be asymmetrical.';

    if (typeLine.includes("Planeswalker")) {
        formattedPrompt += ' Portrait of upper body and head. The entire body should be in the lower 2/3 of the image.';
    }

    if (typeLine.includes("Land")) {
        formattedPrompt += ' An expressive and stylized fantasy landscape painting';
    } else if (typeLine.includes("Instant") ||
        typeLine.includes("Sorcery") ||
        typeLine.includes("Enchantment") ||
        typeLine.includes("Artifact")) {
        formattedPrompt += ` An expressive and stylized fantasy illustration.`;
    } else {
	    formattedPrompt += ` An expressive and stylized fantasy illustration of ${title}, ${description}.`;
    }

    formattedPrompt += '\n\n';
    formattedPrompt += prompt;

    return formattedPrompt;
}

function formatTitle (title:string) {

let formattedTitle = title;

// fixes a specific card, Ratonhnhakké꞉ton
//might not be needed in this framework, test explicitly
//formattedTitle = title.replace('é꞉','e');

// filter known dall e stumbling blocks
formattedTitle = formattedTitle.replace('Damn','Condemn');
formattedTitle = formattedTitle.replace('Dismember','Take Apart');
formattedTitle = formattedTitle.replace('Savage Beating','Fierce Attack');
formattedTitle = formattedTitle.replace('Savage','Harsh');
formattedTitle = formattedTitle.replace('Cabal','Sinister');
formattedTitle = formattedTitle.replace('Aladdin','Arabian Night');
formattedTitle = formattedTitle.replace('Bilbo','Hobbit');
formattedTitle = formattedTitle.replace('Stitch','Sewing');
formattedTitle = formattedTitle.replace('Nymph','Dryad');
formattedTitle = formattedTitle.replace('Emblem','');
formattedTitle = formattedTitle.replace('Sliver','Monster');

// planeswalkers
formattedTitle = formattedTitle.replace('Liliana','pale woman with raven hair. she wears a fancy black and purple ballroom gown. She wears a gold crown. She has glowing purple eyes. she is a necromancer with purple energy. ');
formattedTitle = formattedTitle.replace('Ajani','white lion beastman with gold shoulder pauldrons and a leather strap over his chest. he has a leather and teal loincloth. He has white fur all over his body');
formattedTitle = formattedTitle.replace('Vivien','human woman with dark brown skin and short brown hair. She has glowing green eyes. She wears green and silver leather armor and uses a bow and arrow. She is often accompanied by green spirit animals. ');
formattedTitle = formattedTitle.replace('Tezzeret','black man with white dreadlocks from the future. He has a mechanical arm that glows with purple energy. ');
formattedTitle = formattedTitle.replace('Chandra','young white woman with red hair. She has a leather steampunk outfit including goggles with green lenses. She is pyrokenetic and controls flames. ');
formattedTitle = formattedTitle.replace('Nissa','elf woman with tan skin and brown hair worn in a long braid. She wears a green cloak and robe with brown leather gloves. She has a magical wooden staff. She has green tattoos on her face. ');
formattedTitle = formattedTitle.replace('Teferi','bald, male, black skinned wizard wearing a blue and gold robe with white sleeves.');
formattedTitle = formattedTitle.replace('Sorin','pale skinned male vampire noble. long white hair, black outfit. ');
formattedTitle = formattedTitle.replace('Huatli','Female aztec warrior.  ');
formattedTitle = formattedTitle.replace('Kaya','Black woman with a leather jacket and purple energy weapons. She can phase through walls.  ');
formattedTitle = formattedTitle.replace('Garruk','Viking warrior wearing a metal eye mask with tusks. He has a beard.  He has a green hood and glowing green eyes. His fur cloak has bone spikes. He wears leather armor and uses a giant axe.  ');
formattedTitle = formattedTitle.replace('Karn','Metal golem with large shoulder pads. He has a very serious facial expression.  ');
formattedTitle = formattedTitle.replace('Minsc & Boo','A bald ranger with tan skin and a purple tribal tattoo on his face. He as a hamster on his shoulder. ');
formattedTitle = formattedTitle.replace('Tamiyo','A woman with white hair. Her hair is tied into buns with gold bands. Her skin is bone white. She wears a green cloak with a gold waist cloth. ');	
formattedTitle = formattedTitle.replace('Nicol Bolas','A green - gold dragon with two large horns. His horns are covered in gold armor. A small gold egg floats above his head between the tips of his horns His chin is pointed and he has a face like an imp or demon. ');
formattedTitle = formattedTitle.replace('Saheeli','A female  mage with dark brown skin. She wears with a blue and red Indian dress with gold accents.');
formattedTitle = formattedTitle.replace('Sheoldred','white and red creepy female alien monster. ');

return formattedTitle;
}

function formatDescription (description:string) {
let formattedDescription = description;


formattedDescription = formattedDescription.replace('Sliver','a creepy spiked insectoid mutant snake xenomorph with spikes instead of hands or feet.');
formattedDescription = formattedDescription.replace('Eldrazi','eldricht horror, a scary tentacled mutant');
formattedDescription = formattedDescription.replace('Horror','horrifying nightmare creature');
formattedDescription = formattedDescription.replace('Construct','mechanical monster');
formattedDescription = formattedDescription.replace('Drake','small thin dragon with no legs');
formattedDescription = formattedDescription.replace('Nymph','Dryad');
formattedDescription = formattedDescription.replace('Phyrexian','white and red creepy alien monster');
//formattedDescription = formattedDescription.replace('Soldier','fantasy medieval peasant soldier');

// these are too heavily weighted
formattedDescription = formattedDescription.replace('Hero','');
formattedDescription = formattedDescription.replace('Villain','');

formattedDescription = formattedDescription.replace('Legendary Artifact Creature','');
formattedDescription = formattedDescription.replace('Legendary Enchantment Creature','');
formattedDescription = formattedDescription.replace('Legendary Creature','');
formattedDescription = formattedDescription.replace('Token Creature','');
formattedDescription = formattedDescription.replace('Token','');
formattedDescription = formattedDescription.replace('Creature','');
formattedDescription = formattedDescription.replace('Mono ','');
formattedDescription = formattedDescription.replace('Emblem','');
//formattedDescription = description.replace('Enchantment','');

formattedDescription = formattedDescription.replace('— ','');

console.log ('formatted descrition = '+formattedDescription);
return formattedDescription;
}
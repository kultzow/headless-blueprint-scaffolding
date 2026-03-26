export type DeckMember = {
    name: string;
    count: number;
    awsID: string;
    layout: string;
    variation?: string;
};

export type ScryfallSetData = {
    id: string;
    code: string;
    name: string;
    set_type: string;
    card_count: number;
    uri: string;
    search_uri: string;
    parent_set_code?: string;
    icon_svg_uri?: string;
};

export type ScryfallCardData = {
    id: string;
    oracle_id: string;
    name: string;
    layout: string;
    type_line:string;
    mana_cost:string;
    colors?:string[];
    defense?:string;
    power?:string;
    toughness?:string;
    oracle_text?: string;
    loyalty?:string;
    flavor_name?:string;
    printed_name?:string;
    printed_text?:string;
    printed_type_line?:string;
    card_faces?:CardFaceData[];
    all_parts?:RelatedCardData[];
    image_uris:{
        art_crop:string;
    };
};

export type CardFaceData = {
    name: string;
    layout: string;
    type_line:string;
    mana_cost:string;
    colors?:string[];
    defense?:string;
    power?:string;
    toughness?:string;
    oracle_text?: string;
    loyalty?:string;
    flavor_name?:string;
    printed_name?:string;
    printed_text?:string;
    printed_type_line?:string;
    image_uris:{
        art_crop:string;
    };
}

export type RelatedCardData = {
    id:string;
    component:string;
    name:string;
    type_line:string;
    uri:string;
}
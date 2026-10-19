export interface Address  {
    name: string;
    lat: string;
    lon: string;
    address: SubAddress;
}

interface SubAddress  {
    shop: string;
    road: string;
    suburb: string;
    city: string;
    state: string;
    'ISO3166-2-lvl4': string;
    country: string;
    country_code: string;
}

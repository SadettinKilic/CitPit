// API Service for finans.truncgil.com
// Fetches and caches live prices for assets

export type AssetType =
    | 'gold_gram'      // Gram Altın
    | 'gold_quarter'   // Çeyrek Altın
    | 'gold_half'      // Yarım Altın
    | 'gold_full'      // Tam Altın
    | 'gold_resat'     // Reşat Altın
    | 'silver_gram'    // Gümüş Gram
    | 'usd'            // Amerikan Doları
    | 'eur'            // Euro
    | 'home'           // Ev
    | 'land'           // Arsa
    | 'car';           // Araba

export interface PriceData {
    buying: number;
    selling: number;
    change: number;
    name: string;
    updateDate: string;
}

export interface AllPrices {
    gold_gram: PriceData;
    gold_quarter: PriceData;
    gold_half: PriceData;
    gold_full: PriceData;
    gold_resat: PriceData;
    silver_gram: PriceData;
    usd: PriceData;
    eur: PriceData;
    home: PriceData;
    land: PriceData;
    car: PriceData;
    lastUpdate: string;
}

const API_URL = '/api/prices'; // Use internal proxy to avoid CORS
const CACHE_KEY = 'finflow_prices';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch prices from API
export async function fetchPrices(): Promise<AllPrices | null> {
    try {
        const response = await fetch(`${API_URL}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            }
        });
        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        const prices: AllPrices = {
            gold_gram: {
                buying: data.GRA?.Buying || 0,
                selling: data.GRA?.Selling || 0,
                change: data.GRA?.Change || 0,
                name: 'Gram Altın',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            gold_quarter: {
                buying: data.CEYREKALTIN?.Buying || 0,
                selling: data.CEYREKALTIN?.Selling || 0,
                change: data.CEYREKALTIN?.Change || 0,
                name: 'Çeyrek Altın',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            gold_half: {
                buying: data.YARIMALTIN?.Buying || 0,
                selling: data.YARIMALTIN?.Selling || 0,
                change: data.YARIMALTIN?.Change || 0,
                name: 'Yarım Altın',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            gold_full: {
                buying: data.TAMALTIN?.Buying || 0,
                selling: data.TAMALTIN?.Selling || 0,
                change: data.TAMALTIN?.Change || 0,
                name: 'Tam Altın',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            gold_resat: {
                buying: data.RESATALTIN?.Buying || 0,
                selling: data.RESATALTIN?.Selling || 0,
                change: data.RESATALTIN?.Change || 0,
                name: 'Reşat Altın',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            silver_gram: {
                buying: data.GUMUS?.Buying || 0,
                selling: data.GUMUS?.Selling || 0,
                change: data.GUMUS?.Change || 0,
                name: 'Gümüş Gram',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            usd: {
                buying: data.USD?.Buying || 0,
                selling: data.USD?.Selling || 0,
                change: data.USD?.Change || 0,
                name: 'Amerikan Doları',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            eur: {
                buying: data.EUR?.Buying || 0,
                selling: data.EUR?.Selling || 0,
                change: data.EUR?.Change || 0,
                name: 'Euro',
                updateDate: data.Update_Date || new Date().toISOString(),
            },
            home: { buying: 0, selling: 0, change: 0, name: 'Ev', updateDate: new Date().toISOString() },
            land: { buying: 0, selling: 0, change: 0, name: 'Arsa', updateDate: new Date().toISOString() },
            car: { buying: 0, selling: 0, change: 0, name: 'Araba', updateDate: new Date().toISOString() },
            lastUpdate: new Date().toISOString(),
        };

        // Cache the prices
        const cacheData = {
            prices,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        return prices;
    } catch (error) {
        console.error('Failed to fetch prices:', error);
        return null;
    }
}

// Get prices (from cache or API)
export async function getPrices(): Promise<AllPrices | null> {
    // Check cache first
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const { prices, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            // If cache is fresh, return it
            if (age < CACHE_DURATION) {
                return prices;
            }
        } catch (e) {
            // Invalid cache, fetch new
        }
    }

    // Fetch fresh data
    return await fetchPrices();
}

// Get price for specific asset type
export async function getPriceByType(type: AssetType): Promise<PriceData | null> {
    const prices = await getPrices();
    if (!prices) return null;

    return prices[type];
}

// Get current buying price for asset
export async function getBuyingPrice(type: AssetType): Promise<number> {
    const price = await getPriceByType(type);
    return price?.buying || 0;
}

// Get current selling price for asset
export async function getSellingPrice(type: AssetType): Promise<number> {
    const price = await getPriceByType(type);
    return price?.selling || 0;
}

// Clear cache (force refresh)
export function clearPriceCache() {
    sessionStorage.removeItem(CACHE_KEY);
}

// Get asset type display name
export function getAssetTypeName(type: AssetType): string {
    const names: Record<AssetType, string> = {
        gold_gram: 'Gram Altın',
        gold_quarter: 'Çeyrek Altın',
        gold_half: 'Yarım Altın',
        gold_full: 'Tam Altın',
        gold_resat: 'Reşat Altın',
        silver_gram: 'Gümüş Gram',
        usd: 'Amerikan Doları',
        eur: 'Euro',
        home: 'Ev',
        land: 'Arsa',
        car: 'Araba',
    };
    return names[type];
}

// Get asset type options for dropdown
export function getAssetTypeOptions() {
    return [
        { value: 'gold_gram', label: 'Gram Altın' },
        { value: 'gold_quarter', label: 'Çeyrek Altın' },
        { value: 'gold_half', label: 'Yarım Altın' },
        { value: 'gold_full', label: 'Tam Altın' },
        { value: 'gold_resat', label: 'Reşat Altın' },
        { value: 'silver_gram', label: 'Gümüş (Gram)' },
        { value: 'usd', label: 'Amerikan Doları (USD)' },
        { value: 'eur', label: 'Euro (EUR)' },
        { value: 'car', label: 'Araba' },
        { value: 'home', label: 'Ev' },
        { value: 'land', label: 'Arsa' },
    ];
}

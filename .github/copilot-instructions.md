# FinFlow Codebase Guide for AI Agents

## Project Overview
**FinFlow** is a Next.js 14 personal finance & investment tracking app with:
- **Data Layer**: IndexedDB (Dexie.js) for local-first privacy + Redis (Vercel KV) for leaderboard
- **AI Layer**: Google Gemini for real-time portfolio advice using live market prices
- **Asset Model**: 11+ asset types (gold variants, silver, USD, EUR, real estate)
- **Leaderboard**: Percentage-based profit ranking (privacy-preserving) vs traditional balance ranking

**Key Philosophy**: Financial data lives locally in IndexedDB; only anonymized profit % sent to Redis.

---

## Architecture

### Data Flow
```
User Session (sessionStorage) → IndexedDB (user/asset/transaction data)
                              → Dexie Queries (calculations.ts)
                              → Leaderboard % calculation → Redis (Vercel KV)
                              
Real-time prices: finans.truncgil.com → /api/prices (proxy) → Client cache (5min)
                                                            → Gemini API (advice generation)
```

### Component Structure
- **AppLayout** (root wrapper): PIN-gated session, renders Sidebar + BottomNavigation + children
- **InvestmentAdvisor**: Fetches live prices + user goal → calls `/api/advice` → Gemini streams advice
- **TransactionForm/AssetForm**: Write to IndexedDB with current `userId`
- **LeaderboardPage**: Queries Redis sorted set ranked by `totalProfit` (%)

### Auth Model
- **Single-user per session** (Nick + PIN stored in IndexedDB on first setup)
- `getCurrentUser()` / `getCurrentUserId()` return session user from IndexedDB
- **No network auth**—PIN is local-only; exported JSON files allow backup/restore

---

## Critical Integration Points

### IndexedDB Schema (Dexie)
```typescript
// Key tables indexed by userId for multi-session future-proofing
transactions: '++id, type, category, amount, date, userId'
assets: '++id, assetType, quantity, buyPrice, date, userId'
users: '++id, &nick, pin, createdAt'  // & = unique constraint

// Query pattern: db.assets.where('userId').equals(userId).toArray()
```

### Real-Time Prices
- **Source**: `finans.truncgil.com/v4/today.json` (Turkish exchange rates, gold, commodities)
- **Caching**: 5-min client-side cache + server-side proxy to avoid CORS
- **Usage**: `getPrices()` returns `AllPrices` object with `buying`, `selling`, `change`, `updateDate`
- **Example asset types** map to API fields: `gold_gram` → `data.GRA`, `usd` → `data.USD`

### Redis/Leaderboard (Vercel KV)
```typescript
// Sorted set: leaderboard (score = profit%, member = nick)
await redis.zadd('leaderboard', totalProfit, nick);

// Metadata hash: leaderboard:metadata
await redis.hset('leaderboard:metadata', { [nick]: JSON.stringify({...}) });

// Query: return all entries sorted by score descending
const entries = await redis.zrevrange('leaderboard', 0, -1, 'WITHSCORES');
```
**Calculate profit %**: `(currentPortfolioValue - initialInvestment) / initialInvestment * 100`

### Gemini API Integration
- **Route**: `POST /api/advice`
- **Input**: `{ balance, goal, prices, nick, date }` (all TL currency)
- **Prompt Pattern**: Include real prices in system prompt → concrete recommendations ("Buy X grams of gold at Y price")
- **Output**: Cached in sessionStorage; re-fetched on manual refresh
- **Fallback**: Demo mode if `GEMINI_API_KEY` missing

---

## Key Patterns & Conventions

### Asset Calculations
- **Portfolio Value** = sum of (quantity × sellingPrice) for each asset
- **Total Profit** = (portfolioValue + withdrawals - totalInvested)
- **Profit %** = profit / totalInvested × 100
- See [calculations.ts](lib/calculations.ts) for implementations

### Component State Management
- **Session state**: `sessionStorage.getItem('finflow_unlocked')` (cleared on tab close)
- **Persistent UI**: `localStorage.getItem('finflow_goal')` (goal preference)
- **Price cache**: `sessionStorage.setItem('finflow_prices', JSON.stringify(data))`
- **Event broadcast**: `window.dispatchEvent(new Event('finflow_unlock'))` to reload after PIN entry

### Asset Types & Details
```typescript
type AssetType = 'gold_gram' | 'gold_quarter' | 'gold_half' | 'gold_full' 
               | 'gold_resat' | 'silver_gram' | 'usd' | 'eur' 
               | 'home' | 'land' | 'car';

// Assets can have optional details:
details?: { brand?, model?, year?, km?, m2?, roomCount?, location? }
```

### Styling & UI
- **Framework**: Tailwind CSS 4 + custom components in `/components/ui`
- **Icons**: Lucide React (`Sparkles`, `RefreshCw`, `AlertCircle`, etc.)
- **Dark Theme**: Base color `#030304` (near-black), accent: indigo/purple
- **Layout**: Sidebar (desktop) + BottomNavigation (mobile), responsive at `md:` breakpoint
- **Animations**: Built-in Tailwind + custom glows/pulses for premium feel

### TypeScript Exports
- **lib/api.ts**: `fetchPrices()`, `getPrices()`, `getSellingPrice(assetType)`, type definitions
- **lib/db.ts**: Dexie instance + interfaces (Transaction, Asset, User, Setting)
- **lib/calculations.ts**: `calculateBalance()`, `calculatePortfolioValue()`, `calculateTotalProfit()`, etc.
- **lib/auth.ts**: `getCurrentUser()`, `getCurrentUserId()`, PIN validation

---

## Common Workflows

### Adding a New Asset Type
1. Add to `AssetType` union in [lib/api.ts](lib/api.ts)
2. Add price fetch logic in `fetchPrices()` function
3. Add to `AssetForm.tsx` category select
4. Ensure calculations in [lib/calculations.ts](lib/calculations.ts) handle the new type

### Modifying Gemini Prompt
- Edit prompt template in [app/api/advice/route.ts](app/api/advice/route.ts)
- Include price context from `prices` object for concrete recommendations
- Test format compliance (starts with "Selam {nick}", max 3-4 sentences)

### Updating Leaderboard Calculation
- Profit % calculation in [components/Leaderboard/LeaderboardPage](components/leaderboard/page.tsx)
- Submit endpoint: [app/api/leaderboard/submit/route.ts](app/api/leaderboard/submit/route.ts)
- Fetching: [app/api/leaderboard/get/route.ts](app/api/leaderboard/get/route.ts) queries Redis

### Development Commands
```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint check
```
- Environment: `.env.local` required for `GEMINI_API_KEY`, `KV_*` tokens
- No external database setup needed—IndexedDB works client-side, Redis only for leaderboard

---

## When Implementing Features

✅ **DO**
- Query IndexedDB with `userId` filtering using Dexie's `.where()` API
- Cache prices for 5 minutes using sessionStorage
- Dispatch `finflow_unlock` event when session state changes (other components listen)
- Use `getCurrentUser()` / `getCurrentUserId()` from auth.ts to reference current session
- Return percentage-based metrics for leaderboard fairness

❌ **DON'T**
- Store sensitive financial data in localStorage (use IndexedDB)
- Make external API calls directly from components (use `/api/*` routes as proxy)
- Hardcode prices—always fetch fresh via `getPrices()`
- Use balance comparisons for leaderboard ranking (profit % only)
- Create multiple users in IndexedDB per session (single PIN gate)


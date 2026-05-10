## Codolio Integration Setup Guide

### Backend Dependencies

Install the required packages for web scraping and caching:

```bash
npm install axios cheerio node-cache
```

**Package descriptions:**
- `axios`: HTTP client for fetching web pages
- `cheerio`: jQuery-like syntax for parsing HTML
- `node-cache`: In-memory caching with TTL support

### Installation Steps

#### 1. Install Dependencies
```bash
cd server
npm install axios cheerio node-cache
```

#### 2. Files Created/Modified

**New Files:**
- `src/controllers/codolioController.js` - Controller for fetching and parsing Codolio data
- `src/routes/codolioRoutes.js` - Express routes for Codolio endpoints
- `client/src/hooks/useCodolioStats.js` - React hook for Codolio data fetching
- `client/src/components/CodolioSetup.jsx` - UI component for Codolio username setup

**Modified Files:**
- `src/app.js` - Added Codolio routes
- `client/src/pages/DashboardPage.jsx` - Integrated Codolio data fetching

#### 3. Frontend Setup

On the frontend, users can:
1. Click on the dashboard to set up their Codolio profile
2. Use the CodolioSetup component to enter their username
3. Data will automatically populate the dashboard cards

### API Endpoints

#### Fetch Codolio Stats
```
GET /api/codolio/:username
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "string",
    "totalActiveDays": number,
    "currentStreak": number,
    "longestStreak": number,
    "totalSubmissions": number,
    "acceptanceRate": number,
    "mostUsedPlatform": "string",
    "mostActiveDayIndex": number
  },
  "cached": boolean
}
```

#### Clear Cache
```
DELETE /api/codolio/:username/cache
```
(Requires authentication)

```
DELETE /api/codolio/cache/all
```
(Requires authentication - clears all cache)

### How It Works

1. **API-First Approach**: The controller first attempts to fetch from Codolio's official API (if available)
2. **Fallback to Scraping**: If API fails, it scrapes the user's public Codolio profile page
3. **Caching**: Results are cached for 1 hour to reduce load and improve performance
4. **Error Handling**: Comprehensive error handling with fallback states
5. **Auto-Refresh**: Frontend refetches data every minute (configurable)

### Data Extracted

From Codolio profiles, we extract:
- Total active days (days with submissions)
- Current streak (consecutive days active)
- Longest streak (all-time record)
- Total submissions
- Acceptance rate (%)
- Most used platform (LeetCode, HackerRank, etc.)
- Most active day of week

### Caching Strategy

- **TTL**: 1 hour (3600 seconds)
- **Check Period**: 10 minutes (cleanup interval)
- **Manual Clear**: Users can manually clear cache for immediate refresh
- **Performance**: Reduces scraping load and improves response times

### Error Handling

**Client-side:**
- Loading states while fetching
- Error messages displayed to users
- Fallback to cached data or defaults
- Retry functionality

**Server-side:**
- Timeout handling (5s for API, 10s for scraping)
- Graceful degradation
- Detailed error logging

### Environment Configuration

Add to `.env` file if needed:

```
CODOLIO_API_TIMEOUT=5000
CODOLIO_SCRAPE_TIMEOUT=10000
CODOLIO_CACHE_TTL=3600
```

### Usage Example

#### Frontend Hook:
```javascript
import useCodolioStats from "../hooks/useCodolioStats";

const { stats, loading, error, cached, retry } = useCodolioStats("username", {
  autoFetch: true,
  refetchInterval: 60000 // 1 minute
});
```

#### Frontend Component:
```javascript
import CodolioSetup from "../components/CodolioSetup";

<CodolioSetup 
  onSave={(username) => console.log("Connected to:", username)}
  onClose={() => setShowSetup(false)}
  initialUsername=""
/>
```

### Troubleshooting

1. **"Failed to fetch Codolio profile"**
   - Check if username is correct
   - Verify internet connection
   - Ensure Codolio profile is public

2. **Timeout errors**
   - Codolio server may be slow; try again later
   - Clear cache and retry

3. **Missing data fields**
   - Some profiles may not have all fields
   - Defaults are provided for missing values

### Future Improvements

- [ ] Official Codolio API integration
- [ ] Support for multiple platforms
- [ ] Real-time WebSocket updates
- [ ] Database persistence of historical data
- [ ] Advanced analytics and charts

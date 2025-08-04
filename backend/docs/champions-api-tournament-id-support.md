# Champions API - Tournament ID Support

## Overview

The champions API routes have been enhanced to support both tournament names and tournament IDs as parameters. This provides more flexibility when querying champion statistics.

## Changes

### Affected Routes

The following routes now accept both tournament names and numeric IDs:

- `GET /champions/stats/tournament/:tournament`
- `GET /champions/stats/player/:player/tournament/:tournament`
- `GET /champions/stats/team/:team/tournament/:tournament`

### Parameter Format

The `tournament` parameter can now be:
- **Tournament Name**: e.g., `LEC_2024_Spring`, `Worlds_2024`
- **Tournament ID**: e.g., `123`, `456` (numeric ID as a string)

### Examples

```bash
# Using tournament name
GET /champions/stats/tournament/LEC_2024_Spring

# Using tournament ID
GET /champions/stats/tournament/123

# Player stats with tournament name
GET /champions/stats/player/Caps/tournament/Worlds_2024

# Player stats with tournament ID
GET /champions/stats/player/Caps/tournament/456

# Team stats with tournament name
GET /champions/stats/team/G2%20Esports/tournament/LEC_2024_Spring

# Team stats with tournament ID
GET /champions/stats/team/G2%20Esports/tournament/123
```

## Implementation Details

### Tournament Resolution

When a tournament identifier is provided:

1. **Numeric Check**: If the parameter is numeric, it's treated as a tournament ID
2. **Database Lookup**: The system queries the Tournament table to resolve the ID to tournament details
3. **Fallback**: If not found as ID, it tries to match by name, overviewPage, or standardName
4. **Query Building**: Appropriate database conditions are built to query champion statistics

### Database Queries

The system builds flexible queries that can match tournaments by:
- `tournament` field (name)
- `overviewPage` field (contains match)
- Original identifier (for backward compatibility)

### Caching

Cache keys remain based on the original parameter to ensure:
- Consistent caching behavior
- No cache invalidation issues
- Separate cache entries for ID vs name queries

## Backward Compatibility

All existing API calls using tournament names continue to work without any changes. The enhancement is fully backward compatible.

## Error Handling

- If a tournament ID doesn't exist, the API returns no data (same as invalid tournament name)
- Error messages include the original parameter provided by the client
- HTTP status codes remain unchanged (404 for no data, 500 for server errors)
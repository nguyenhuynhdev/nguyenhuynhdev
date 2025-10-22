# GET /functions/post?slug=...

Source: `functions/post.ts`

Returns a specific post by `slug` from D1 table `posts`.

## Request
- Method: `GET`
- Query: `slug` (required)

## Responses
- 200
```json
{
  "success": true,
  "count": 1,
  "data": [ { "id": 1, "slug": "hello" } ]
}
```
- 400 `{ "error": "Missing slug param" }`
- 500 `{ "error": string }`

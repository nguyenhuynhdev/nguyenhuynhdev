# GET /functions/posts

Source: `functions/posts.ts`

Returns all posts from D1 table `posts`.

## Request
- Method: `GET`

## Response
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "slug": "hello", "title": "Hello" }
  ]
}
```

## Error
- 500 `{ "error": string }`

# GET /functions/projects

Source: `functions/projects.ts`

Returns all projects from D1 table `projects`.

## Request
- Method: `GET`

## Response
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "name": "Example" }
  ]
}
```

## Error
- 500 `{ "error": string }`

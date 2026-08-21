# Plan: Add Team Members Resource

## Goal
Add MCP resource `tracker://team/members` that returns current user's team members (id + fullNameRu).

## API
- `GET /api/v1/user/roles?status=true&active=1&departments=36`
- Response: array or `{ data: [...] }` of user objects
- Map each to `{ id, fullNameRu }`

## Changes

### 1. Create `src/resources/tracker/team-members.ts`
- Follow pattern from `projects.ts`
- Resource name: `"team-members"`, URI: `"tracker://team/members"`
- Call `client.get("/api/v1/user/roles?status=true&active=1&departments=36")`
- Map response to `{ id, fullNameRu }[]`
- Error handling: return text in `contents` (same pattern as other resources)

### 2. Update `src/resources/tracker/index.ts`
- Import `registerTeamMembersResource` from `./team-members.js`
- Call it inside `registerTrackerResources`

## Validation
- `npm run build` — must compile clean

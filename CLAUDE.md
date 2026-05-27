# Bartender — CLAUDE.md

## Project Overview

Bartender is a cocktail recipe management app. Users can create and manage recipes, track a personal ingredient inventory, and discover which drinks they can make with what they have on hand.

**Tech Stack:**
- Frontend: Angular 19 (standalone components, Signals-based state)
- Backend: .NET 9 (ASP.NET Core, CQRS via MediatR, EF Core 9, SQL Server)
- Deployment: Docker Compose with Nginx reverse proxy

---

## Repository Structure

```
bartender/
├── bartender-client/          # Angular 19 frontend
│   └── src/app/
│       ├── core/data-access/  # Models, HTTP service, AppStore (signals)
│       └── routes/            # Page components
├── Bartender.Api/             # .NET 9 backend
│   ├── Controllers/           # RecipeController, InventoryController
│   ├── Domain/                # EF Core models, DbContext, entity configs
│   ├── Services/
│   │   ├── Handlers/          # MediatR CQRS handlers (Commands + Queries)
│   │   ├── Methods/           # Shared utilities (Lookup, Normalizing)
│   │   └── Models/            # DTOs and mapping extensions
│   └── Migrations/            # EF Core migrations
└── docker-compose.yml
```

---

## Common Commands

### Frontend

```bash
cd bartender-client
npm start          # Dev server → http://localhost:4200
npm run build      # Production build
npm test           # Karma/Jasmine tests
```

### Backend

```bash
cd Bartender.Api
dotnet run         # Dev server → https://localhost:44389
```

### Docker (full stack)

```bash
docker-compose up   # API on :5000, Web on :8088
docker-compose down
```

---

## Architecture

### Frontend

- **AppStore** (`core/data-access/store/store.ts`) — central state using Angular Signals; computed signals derive filtered recipes and makeability.
- **BartenderHttpService** (`core/data-access/services/bartender-http.service.ts`) — all API calls.
- **Routes:** `recipe-list`, `recipe-detail`, `recipe-editor`, `inventory`, `makeable`, `shell` (layout).
- Standalone components throughout — no NgModules.

### Backend

- **CQRS via MediatR:** controllers dispatch requests to handlers; no business logic in controllers.
- **EF Core + SQL Server:** schema `bartender`, `BartenderContext` via `IBartenderContext`.
- **AddRecipeHandler** automatically syncs inventory entries when a recipe is created.
- `ILookup` provides a repository-style helper for loading full recipe graphs.
- `Normalizing` helpers standardize ingredient key strings for inventory matching.

### Data Model (key entities)

| Entity | Purpose |
|---|---|
| `Recipe` | Core recipe with name, description, base spirit, glass, garnish, images |
| `RecipeIngredient` | Parsed ingredient with amount, unit, optional flag |
| `RecipeStep` | Ordered instruction steps |
| `RecipeCategory` | Tags (Classic, Sour, Highball, etc.) |
| `InventoryItem` | User's available ingredients with normalized lookup key |

---

## Environment & Config

### Frontend environments

| File | API Base |
|---|---|
| `environment.ts` (dev) | `https://localhost:44389` (or `http://localhost:5000`) |
| `environment.prod.ts` | `/api` (proxied by Nginx) |

### Backend

- Connection string read from the `Default` environment variable (or user secrets locally).
- CORS allows: `localhost:4200`, `localhost:8088`, `192.168.0.64:8088`, `localhost:5173`.
- Health check: `GET /api/health` → `{ ok: true, at: <utc> }`.
- Dev overrides in `appsettings.Development.json`; secrets via `dotnet user-secrets` (id: `e4ea3cd2-01ae-49c2-9b6d-788ae255db1f`).

---

## Code Conventions

### TypeScript / Angular

- `strict: true` across the board; no implicit returns, no fallthrough cases.
- `strictTemplates: true` — templates are fully type-checked.
- Standalone components only — no NgModules.
- Prefer Signals and computed values over RxJS for new state.

### C#

- Nullable reference types enabled — avoid `!` unless certain.
- Implicit usings enabled.
- DTOs are `record` types.
- All handler methods are `async`; use `await` consistently.
- JSON serialized with camelCase naming via `JsonSerializerOptions`.

---

## Testing

- **Frontend:** Karma + Jasmine. Run `npm test`. Spec files live alongside source (`.spec.ts`).
- **Backend:** No test project exists yet.

---

## No CI/CD

No pipelines configured. Docker Compose is the primary deployment mechanism.

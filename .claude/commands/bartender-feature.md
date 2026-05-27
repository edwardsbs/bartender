# Bartender App — Feature Development Guide

You are working on the **Bartender** cocktail recipe management app. When asked to add or modify a feature, follow all conventions below exactly. Do not deviate from established patterns.

---

## Tech Stack

- **Frontend:** Angular 19 — standalone components, Signals-based state, no NgModules, strict TypeScript
- **Backend:** .NET 9 — ASP.NET Core, CQRS via MediatR, EF Core 9, SQL Server, nullable reference types enabled
- **Deployment:** Docker Compose + Nginx reverse proxy

---

## Repository Layout

```
bartender-client/src/app/
  core/data-access/
    models/models.ts          ← TypeScript interfaces (Recipe, IngredientLine, etc.)
    services/bartender-http.service.ts  ← All HTTP calls (Observables)
    store/store.ts            ← AppStore: signals + actions
  routes/
    recipe-list/
    recipe-detail/
    recipe-editor/
    inventory/
    makeable/

Bartender.Api/Bartender.Api/
  Controllers/                ← Thin controllers (dispatch to MediatR only)
  Domain/
    Models/                   ← EF Core entity classes
    BartenderContext.cs       ← DbContext (schema: bartender)
  Services/
    Handlers/
      Models/
        Dtos/Dtos.cs          ← All DTO records
        Mapping/MappingExtensions.cs  ← .ToDto() extension methods
      Methods/
        Lookup.cs             ← ILookup service (loads full entity graphs)
        Normalizing.cs        ← Ingredient key normalization helpers
      Recipes/
        Commands/             ← Mutating operations (Add, Edit, Delete)
        Queries/              ← Read operations (Get, GetById)
      Inventory/
        Commands/
        Queries/
  Migrations/                 ← EF Core migrations
```

---

## End-to-End Feature Checklist

When adding a new field or feature, touch these layers **in order**:

### 1. Frontend model — `models.ts`
```typescript
export interface Recipe {
  // Add new optional fields with `?`
  newField?: string;
}
```
- Use `interface`, not `class` or `type` alias
- Optional fields use `?`, never `| undefined` explicitly
- Timestamps are `string` (ISO)
- IDs are `string` (GUID format)

---

### 2. Backend DTO — `Services/Handlers/Models/Dtos/Dtos.cs`
```csharp
// Read DTO: positional record, all fields
public record RecipeDto(
    Guid Id,
    string Name,
    string? NewField,   // nullable for optional
    // ...
);

// Write DTO: separate record for incoming payloads
public record UpsertRecipeDto(
    Guid? Id,           // nullable = insert when null
    string Name,
    string? NewField,
    // ...
);
```
- **Always records, never classes**
- Positional constructor syntax
- Separate read (e.g. `RecipeDto`) and write (e.g. `UpsertRecipeDto`) DTOs
- `Guid? Id` on upsert DTOs to distinguish insert vs update

---

### 3. Domain model — `Domain/Models/`
```csharp
public class Recipe
{
    [Key] public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = default!;

    [MaxLength(2000)]
    public string? NewField { get; set; }         // nullable optional

    public List<RecipeIngredient> Ingredients { get; set; } = new();  // nav props initialized
}
```
- Entity classes (not records)
- `[Key]`, `[ForeignKey]`, `[MaxLength]` data annotations
- Non-nullable strings: `= default!`
- Navigation properties: `= new()`
- Nullable reference types enabled — use `?` for optional fields

---

### 4. Mapping — `Services/Handlers/Models/Mapping/MappingExtensions.cs`
```csharp
public static RecipeDto ToDto(this Recipe r) =>
    new(
        r.Id,
        r.Name,
        r.NewField,
        // ... all fields in DTO positional order
        r.Ingredients
            .OrderBy(i => i.SortOrder)
            .Select(i => i.ToDto())
            .ToArray()
    );
```
- Extension method on entity: `.ToDto()`
- Expression-bodied where possible
- Always sort child collections (SortOrder / StepNumber)
- Add `.ToDtos()` batch overload on `List<T>` if useful

---

### 5. MediatR Handler — new folder under `Handlers/Recipes/Commands/` or `Queries/`

**Folder:** `Services/Handlers/Recipes/Commands/DoSomething/DoSomethingHandler.cs`

```csharp
namespace Bartender.Api.Services.Handlers.Recipes.Commands.DoSomething;

public record DoSomethingRequest(Guid Id, DoSomethingDto dto) : IRequest<RecipeDto?>;

public class DoSomethingHandler : IRequestHandler<DoSomethingRequest, RecipeDto?>
{
    private readonly IBartenderContext _context;
    private readonly ILookup _lookup;

    public DoSomethingHandler(IBartenderContext context, ILookup lookup)
    {
        _context = context;
        _lookup = lookup;
    }

    public async Task<RecipeDto?> Handle(DoSomethingRequest request, CancellationToken token)
    {
        var recipe = await _lookup.LoadRecipeGraph(request.Id, token);
        if (recipe is null) return null;

        recipe.SomeField = request.dto.SomeField?.Trim();
        recipe.UpdatedAtUtc = DateTime.UtcNow;

        _context.Recipes.Update(recipe);
        await _context.SaveChangesAsync(token);

        return recipe.ToDto();
    }
}
```

**Query handler:**
```csharp
public record GetRecipesRequest : IRequest<List<RecipeDto>>;

public class GetRecipesHandler : IRequestHandler<GetRecipesRequest, List<RecipeDto>>
{
    private readonly IBartenderContext _context;

    public GetRecipesHandler(IBartenderContext context) => _context = context;

    public async Task<List<RecipeDto>> Handle(GetRecipesRequest request, CancellationToken token)
    {
        var recipes = await _context.Recipes
            .AsNoTracking()
            .Include(r => r.Categories)
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .OrderByDescending(r => r.UpdatedAtUtc)
            .ToListAsync(token);

        return recipes.ToDtos();
    }
}
```

- Request is a `record` implementing `IRequest<T>`
- Handler class implements `IRequestHandler<TRequest, TResponse>`
- Constructor injection only
- All DB ops are `async` with `CancellationToken`
- Read queries: `AsNoTracking()` + `Include()` for eager loading
- Write commands: load via `ILookup`, mutate, `SaveChangesAsync`
- MediatR auto-discovers handlers — no registration needed

---

### 6. Controller — `Controllers/RecipeController.cs`
```csharp
[HttpPut("do-something/{id}")]
public async Task<ActionResult> DoSomething(Guid id, [FromBody] DoSomethingDto dto)
{
    return Ok(await _mediator.Send(new DoSomethingRequest(id, dto)));
}
```
- No business logic in controllers — only `_mediator.Send(...)`
- Route uses `[controller]` prefix → `/Recipe/do-something/{id}`
- Always `async Task<ActionResult>`
- Always return `Ok(result)`
- `[FromBody]` for POST/PUT payloads; route param for IDs

---

### 7. HTTP Service — `bartender-http.service.ts`
```typescript
doSomething(id: string, payload: SomeDto): Observable<Recipe> {
  return this.http.put<Recipe>(`${this.apiPath}/Recipe/do-something/${id}`, payload);
}
```
- All methods return `Observable<T>` from `HttpClient`
- Base path from `environment.apiUrl`
- Mirror the backend route exactly

---

### 8. AppStore — `store.ts`
```typescript
doSomething(id: string, payload: SomeDto) {
  this.http.doSomething(id, payload).subscribe({
    next: (res) => {
      this.recipes.update(list =>
        list.map(r => r.id === res.id ? res : r)
      );
    }
  });
}
```
- All mutations live in AppStore, never in components
- HTTP calls via `this.http.*` then update signals
- Immutable updates: use `map` / spread, never mutate in place
- `.update(fn)` for signal transforms; `.set(val)` for replacements
- Navigate with `this.router.navigate([...])` on success when needed

---

### 9. Component — `routes/<feature>/<feature>.component.ts`
```typescript
@Component({
  selector: 'feature-name',           // kebab-case
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss'],
  imports: [RouterLink, NgClass, /* ... */]  // standalone only
})
export class FeatureNameComponent {
  appStore = inject(AppStore);

  // Local UI state as signals
  inputValue = signal('');

  // Derived from store signals
  items = computed(() => this.appStore.recipes());

  // Reactive side effect (constructor or field initializer)
  _ = effect(() => {
    const id = this.someSignal();
    if (!id) return;
    this.inputValue.set(this.appStore.recipeById(id)()?.name ?? '');
  });

  submit() {
    this.appStore.doSomething(this.id(), this.inputValue());
  }
}
```
- `inject()` for DI, not constructor injection
- Local UI state (`signal<T>`) separate from store state
- Computed signals for derived view data
- `effect()` for reactive initialization (not `ngOnInit` + subscriptions)
- No business logic — delegate everything to AppStore

---

### 10. Template
```html
<!-- Signal reads require () -->
<input [value]="inputValue()" (input)="inputValue.set($any($event.target).value)" />

<!-- New control flow syntax -->
@if (recipe()) {
  <h1>{{ recipe()!.name }}</h1>
} @else {
  <p>Loading...</p>
}

@for (item of items(); track item.id) {
  <li [class.active]="selected() === item.id">{{ item.name }}</li>
}
```
- Signals: always call as `signal()` in templates
- Control flow: `@if`, `@else`, `@for` (not `*ngIf`, `*ngFor`)
- `@for` requires `track` expression
- Class binding: `[class.name]="boolExpr()"`
- Event targets: `$any($event.target).value` to bypass strict null checks

---

### 11. EF Core Migration (after domain model changes)
```bash
cd Bartender.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---

## Key Rules to Never Violate

| Rule | Detail |
|---|---|
| Records for DTOs | All request/response objects are C# `record`, never `class` |
| No logic in controllers | Controllers only call `_mediator.Send(...)` |
| No RxJS for state | Observables only for HTTP; all app state is Signals |
| Immutable signal updates | Never mutate signal values in place |
| Strict null safety | TypeScript `strict: true`; C# nullable refs enabled |
| camelCase JSON | Backend serializes as camelCase for frontend |
| Async/await everywhere | All DB and HTTP operations must be awaited |
| `AsNoTracking` on reads | All query handlers use `.AsNoTracking()` |
| Schema prefix | All EF tables use schema `bartender` |
| GUID IDs | All entity PKs are `Guid` on backend, `string` on frontend |

---

## Common Patterns Quick Reference

### Normalized ingredient key (backend)
```csharp
var key = Normalizing.IngredientKey(ingredient.Item);
```

### Load full recipe graph (backend)
```csharp
var recipe = await _lookup.LoadRecipeGraph(id, cancellationToken);
```

### Signal derived from route param (frontend)
```typescript
private route = inject(ActivatedRoute);
id = toSignal(this.route.paramMap.pipe(map(p => p.get('id') ?? '')));
recipe = computed(() => this.appStore.recipeById(this.id() ?? '')());
```

### Optimistic update pattern (frontend)
```typescript
// Update signal immediately, then sync from server response
this.recipes.update(list => list.map(r => r.id === id ? { ...r, ...patch } : r));
this.http.editRecipe(payload).subscribe({ next: res => this.recipes.update(list => list.map(r => r.id === res.id ? res : r)) });
```

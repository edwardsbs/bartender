using Bartender.Api;
using System.Reflection;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

var provider = builder.Services.BuildServiceProvider();
var configuration = provider.GetRequiredService<IConfiguration>();

builder.Services.AddBartenderApps(configuration);

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = false;
        opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    }
    );

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core SQL Server
//builder.Services.AddDbContext<BartenderContext>(opt =>
//{
//    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
//});

// CORS for Angular dev server (adjust ports as needed)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("dev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "http://localhost:8088",
                "http://localhost:5173" // if you ever use Vite or something
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(Assembly.GetExecutingAssembly()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("dev");

app.MapGet("/api/health", () => Results.Ok(new { ok = true, at = DateTime.UtcNow }));

app.MapControllers();

app.Run();



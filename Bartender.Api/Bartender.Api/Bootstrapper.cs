using Bartender.Api.Domain;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Methods;
using Bartender.Api.Services.Handlers.Recipes.Queries.GetRecipes;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api;

public static class Bootstrapper
{
    public static IServiceCollection AddBartenderApps(this IServiceCollection services, IConfiguration config)
    {
        //Pipeline Behaviors


        //Entity Framework
        services.AddDbContext<BartenderContext>(
            builder => builder.UseSqlServer(config["Default"],
                    x => x.MigrationsAssembly(typeof(BartenderContext).Assembly.FullName))
                .EnableSensitiveDataLogging());

        services.AddTransient<IBartenderContext>();

        //Mediator
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(GetRecipesHandler).Assembly));
        

        //Repositories
        services.AddTransient<ILookup, Lookup>();



        return services;
    }
}

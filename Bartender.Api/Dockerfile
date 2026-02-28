# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy just the csproj first (better caching)
COPY ["Bartender.Api/Bartender.Api.csproj", "Bartender.Api/"]
RUN dotnet restore "Bartender.Api/Bartender.Api.csproj"

# Copy everything else
COPY . .
RUN dotnet publish "Bartender.Api/Bartender.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Bartender.Api.dll"]
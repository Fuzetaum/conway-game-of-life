FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["Backend/ConwayGameOfLife.sln", "Backend/"]
COPY ["Backend/src/ConwayGameOfLife.Api/ConwayGameOfLife.Api.csproj", "Backend/src/ConwayGameOfLife.Api/"]
COPY ["Backend/src/ConwayGameOfLife.Domain/ConwayGameOfLife.Domain.csproj", "Backend/src/ConwayGameOfLife.Domain/"]
COPY ["Backend/src/ConwayGameOfLife.Infrastructure/ConwayGameOfLife.Infrastructure.csproj", "Backend/src/ConwayGameOfLife.Infrastructure/"]
RUN dotnet restore "Backend/ConwayGameOfLife.sln"
COPY . .
WORKDIR "/src/Backend"
RUN dotnet build "ConwayGameOfLife.sln" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ConwayGameOfLife.sln" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ConwayGameOfLife.Api.dll"]
# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first to cache restore layer
COPY Directory.Build.props Directory.Packages.props global.json ./
COPY apps/api/src/SupportDesk.Domain/SupportDesk.Domain.csproj apps/api/src/SupportDesk.Domain/
COPY apps/api/src/SupportDesk.Application/SupportDesk.Application.csproj apps/api/src/SupportDesk.Application/
COPY apps/api/src/SupportDesk.Infrastructure/SupportDesk.Infrastructure.csproj apps/api/src/SupportDesk.Infrastructure/
COPY apps/api/src/SupportDesk.Presentation/SupportDesk.Presentation.csproj apps/api/src/SupportDesk.Presentation/
COPY apps/api/tests/SupportDesk.ArchitectureTests/SupportDesk.ArchitectureTests.csproj apps/api/tests/SupportDesk.ArchitectureTests/
COPY apps/api/tests/SupportDesk.UnitTests/SupportDesk.UnitTests.csproj apps/api/tests/SupportDesk.UnitTests/

RUN dotnet restore apps/api/src/SupportDesk.Presentation/SupportDesk.Presentation.csproj

# Copy the rest of the source code
COPY apps/api/ apps/api/

WORKDIR /src/apps/api/src/SupportDesk.Presentation
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Run as non-root user for enhanced security
RUN useradd -m appuser
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SupportDesk.Presentation.dll"]

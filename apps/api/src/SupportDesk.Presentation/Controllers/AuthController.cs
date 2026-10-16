using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SupportDesk.Application.Features.Agents.Queries.GetAgents;

namespace SupportDesk.Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(GetAgentsQueryHandler getAgentsQueryHandler, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required." });
        }

        // Fetch agents using the existing query handler
        var agents = await getAgentsQueryHandler.HandleAsync(ct);
        var agent = agents.FirstOrDefault(a => a.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));

        if (agent is null)
        {
            return Unauthorized(new { message = "Invalid credentials or inactive account." });
        }

        var jwtSettings = configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"] ?? "SuperSecretNorthwindSupportKeyThatIsAtLeast32BytesLong!";
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, agent.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, agent.Email),
            new Claim(ClaimTypes.Name, agent.FullName),
            new Claim(ClaimTypes.Role, "Agent")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(double.TryParse(jwtSettings["DurationInHours"], out var h) ? h : 8),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = tokenHandler.WriteToken(token);

        return Ok(new
        {
            token = jwtToken,
            agent = new
            {
                id = agent.Id,
                fullName = agent.FullName,
                email = agent.Email
            }
        });
    }
}

public sealed record LoginRequest(string Email);

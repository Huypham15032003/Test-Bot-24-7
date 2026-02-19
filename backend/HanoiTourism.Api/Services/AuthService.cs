using HanoiTourism.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HanoiTourism.Api.Services;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly List<User> _users = new()
    {
        new User { Id = 1, Username = "admin", Password = "admin123", FullName = "System Admin", Role = "Admin" }
    };

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public User? Register(RegisterRequest request)
    {
        if (_users.Any(u => u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase)))
            return null;

        var user = new User
        {
            Id = _users.MaxBy(x => x.Id)?.Id + 1 ?? 1,
            Username = request.Username.Trim(),
            Password = request.Password,
            FullName = request.FullName.Trim(),
            Role = "User"
        };

        _users.Add(user);
        return user;
    }

    public AuthResponse? Login(LoginRequest request)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase)
            && u.Password == request.Password);

        return user is null ? null : new AuthResponse(GenerateJwt(user), user.Username, user.FullName, user.Role);
    }

    private string GenerateJwt(User user)
    {
        var issuer = _config["Jwt:Issuer"] ?? "HanoiTourism";
        var audience = _config["Jwt:Audience"] ?? "HanoiTourismClient";
        var key = _config["Jwt:Key"] ?? "THIS_IS_A_DEMO_KEY_CHANGE_IN_PRODUCTION_123456";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Username),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new("fullName", user.FullName),
            new(ClaimTypes.Role, user.Role)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

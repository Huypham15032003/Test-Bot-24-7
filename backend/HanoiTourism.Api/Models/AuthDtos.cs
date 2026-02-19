namespace HanoiTourism.Api.Models;

public record RegisterRequest(string Username, string Password, string FullName);
public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string Username, string FullName, string Role);

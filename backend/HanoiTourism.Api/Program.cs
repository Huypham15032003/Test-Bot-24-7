using HanoiTourism.Api.Middleware;
using HanoiTourism.Api.Models;
using HanoiTourism.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddSingleton<PlaceStore>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<ReviewStore>();
builder.Services.AddSingleton<BookingStore>();

builder.Services.AddCors(o => o.AddPolicy("web", p =>
    p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "THIS_IS_A_DEMO_KEY_CHANGE_IN_PRODUCTION_123456";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HanoiTourism";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HanoiTourismClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", at = DateTime.UtcNow }));

app.MapPost("/api/auth/register", (RegisterRequest request, AuthService auth) =>
{
    if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest(new { message = "Username and password are required" });

    var user = auth.Register(request);
    return user is null
        ? Results.Conflict(new { message = "Username already exists" })
        : Results.Ok(new { message = "Registered successfully" });
});

app.MapPost("/api/auth/login", (LoginRequest request, AuthService auth) =>
{
    var result = auth.Login(request);
    return result is null
        ? Results.Unauthorized()
        : Results.Ok(result);
});

app.MapGet("/api/places", (string? q, string? category, PlaceStore store) =>
    Results.Ok(store.GetAll(q, category)));

app.MapGet("/api/places/{id:int}", (int id, PlaceStore store) =>
{
    var place = store.GetById(id);
    return place is null ? Results.NotFound() : Results.Ok(place);
});

app.MapPost("/api/places", (Place place, PlaceStore store) =>
    Results.Created($"/api/places/{store.Create(place).Id}", place));

app.MapPut("/api/places/{id:int}", (int id, Place place, PlaceStore store) =>
    store.Update(id, place) ? Results.NoContent() : Results.NotFound());

app.MapDelete("/api/places/{id:int}", (int id, PlaceStore store) =>
    store.Delete(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/api/reviews", (int placeId, ReviewStore reviews) =>
    Results.Ok(reviews.GetByPlace(placeId)));

app.MapPost("/api/reviews", (Review review, ClaimsPrincipal user, ReviewStore reviews, PlaceStore places) =>
{
    var username = user.Identity?.Name ?? user.FindFirstValue(ClaimTypes.Name) ?? user.FindFirstValue("unique_name");
    if (string.IsNullOrWhiteSpace(username)) return Results.Unauthorized();
    if (review.Rating < 1 || review.Rating > 5) return Results.BadRequest(new { message = "Rating must be 1..5" });
    if (places.GetById(review.PlaceId) is null) return Results.NotFound(new { message = "Place not found" });

    review.Username = username;
    var created = reviews.Create(review);
    return Results.Created($"/api/reviews/{created.Id}", created);
}).RequireAuthorization();

app.MapGet("/api/bookings/my", (ClaimsPrincipal user, BookingStore bookings) =>
{
    var username = user.Identity?.Name ?? user.FindFirstValue(ClaimTypes.Name) ?? user.FindFirstValue("unique_name");
    if (string.IsNullOrWhiteSpace(username)) return Results.Unauthorized();
    return Results.Ok(bookings.GetByUser(username));
}).RequireAuthorization();

app.MapPost("/api/bookings", (Booking booking, ClaimsPrincipal user, BookingStore bookings, PlaceStore places) =>
{
    var username = user.Identity?.Name ?? user.FindFirstValue(ClaimTypes.Name) ?? user.FindFirstValue("unique_name");
    if (string.IsNullOrWhiteSpace(username)) return Results.Unauthorized();

    var place = places.GetById(booking.PlaceId);
    if (place is null) return Results.NotFound(new { message = "Place not found" });
    if (booking.Quantity <= 0) return Results.BadRequest(new { message = "Quantity must be > 0" });

    booking.Username = username;
    booking.TotalAmount = place.TicketPrice * booking.Quantity;
    var created = bookings.Create(booking);
    return Results.Created($"/api/bookings/{created.Id}", created);
}).RequireAuthorization();

app.Run();

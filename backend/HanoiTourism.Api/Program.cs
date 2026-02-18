using HanoiTourism.Api.Models;
using HanoiTourism.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<PlaceStore>();
builder.Services.AddCors(o => o.AddPolicy("web", p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("web");

app.MapGet("/api/places", (string? q, string? category, PlaceStore store) => Results.Ok(store.GetAll(q, category)));
app.MapGet("/api/places/{id:int}", (int id, PlaceStore store) =>
{
    var place = store.GetById(id);
    return place is null ? Results.NotFound() : Results.Ok(place);
});
app.MapPost("/api/places", (Place place, PlaceStore store) => Results.Created($"/api/places/{store.Create(place).Id}", place));
app.MapPut("/api/places/{id:int}", (int id, Place place, PlaceStore store) => store.Update(id, place) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/api/places/{id:int}", (int id, PlaceStore store) => store.Delete(id) ? Results.NoContent() : Results.NotFound());

app.Run();

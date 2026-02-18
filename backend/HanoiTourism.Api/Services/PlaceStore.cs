using HanoiTourism.Api.Data;
using HanoiTourism.Api.Models;

namespace HanoiTourism.Api.Services;

public class PlaceStore
{
    private readonly List<Place> _places = SeedData.Places;

    public IEnumerable<Place> GetAll(string? q, string? category)
    {
        var query = _places.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Name.Contains(q, StringComparison.OrdinalIgnoreCase)
                                  || p.Description.Contains(q, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        return query;
    }

    public Place? GetById(int id) => _places.FirstOrDefault(p => p.Id == id);

    public Place Create(Place p)
    {
        p.Id = _places.Any() ? _places.Max(x => x.Id) + 1 : 1;
        _places.Add(p);
        return p;
    }

    public bool Update(int id, Place p)
    {
        var existing = GetById(id);
        if (existing is null) return false;
        existing.Name = p.Name; existing.Description = p.Description; existing.Category = p.Category;
        existing.Address = p.Address; existing.Latitude = p.Latitude; existing.Longitude = p.Longitude; existing.TicketPrice = p.TicketPrice;
        return true;
    }

    public bool Delete(int id)
    {
        var existing = GetById(id);
        if (existing is null) return false;
        _places.Remove(existing);
        return true;
    }
}

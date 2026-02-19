using HanoiTourism.Api.Models;

namespace HanoiTourism.Api.Services;

public class ReviewStore
{
    private readonly List<Review> _reviews = new();

    public IEnumerable<Review> GetByPlace(int placeId) =>
        _reviews.Where(r => r.PlaceId == placeId).OrderByDescending(r => r.CreatedAtUtc);

    public IEnumerable<Review> GetByUser(string username) =>
        _reviews.Where(r => r.Username.Equals(username, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.CreatedAtUtc);

    public Review? GetById(int id) => _reviews.FirstOrDefault(r => r.Id == id);

    public Review Create(Review review)
    {
        review.Id = _reviews.MaxBy(r => r.Id)?.Id + 1 ?? 1;
        review.CreatedAtUtc = DateTime.UtcNow;
        _reviews.Add(review);
        return review;
    }

    public bool Delete(int id)
    {
        var review = GetById(id);
        if (review is null) return false;
        _reviews.Remove(review);
        return true;
    }
}

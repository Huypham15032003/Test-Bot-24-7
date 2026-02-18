using HanoiTourism.Api.Models;

namespace HanoiTourism.Api.Services;

public class ReviewStore
{
    private readonly List<Review> _reviews = new();

    public IEnumerable<Review> GetByPlace(int placeId) =>
        _reviews.Where(r => r.PlaceId == placeId).OrderByDescending(r => r.CreatedAtUtc);

    public Review Create(Review review)
    {
        review.Id = _reviews.MaxBy(r => r.Id)?.Id + 1 ?? 1;
        review.CreatedAtUtc = DateTime.UtcNow;
        _reviews.Add(review);
        return review;
    }
}

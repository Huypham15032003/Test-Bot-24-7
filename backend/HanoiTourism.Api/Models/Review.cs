namespace HanoiTourism.Api.Models;

public class Review
{
    public int Id { get; set; }
    public int PlaceId { get; set; }
    public string Username { get; set; } = "";
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

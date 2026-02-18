namespace HanoiTourism.Api.Models;

public class Booking
{
    public int Id { get; set; }
    public int PlaceId { get; set; }
    public string Username { get; set; } = "";
    public string VisitorName { get; set; } = "";
    public int Quantity { get; set; }
    public DateOnly VisitDate { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

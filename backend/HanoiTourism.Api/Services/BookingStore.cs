using HanoiTourism.Api.Models;

namespace HanoiTourism.Api.Services;

public class BookingStore
{
    private readonly List<Booking> _bookings = new();

    public IEnumerable<Booking> GetByUser(string username) =>
        _bookings.Where(b => b.Username.Equals(username, StringComparison.OrdinalIgnoreCase))
                 .OrderByDescending(b => b.CreatedAtUtc);

    public Booking? GetById(int id) => _bookings.FirstOrDefault(b => b.Id == id);

    public Booking Create(Booking booking)
    {
        booking.Id = _bookings.MaxBy(b => b.Id)?.Id + 1 ?? 1;
        booking.CreatedAtUtc = DateTime.UtcNow;
        _bookings.Add(booking);
        return booking;
    }

    public bool Delete(int id)
    {
        var booking = GetById(id);
        if (booking is null) return false;
        _bookings.Remove(booking);
        return true;
    }
}

using HanoiTourism.Api.Models;

namespace HanoiTourism.Api.Data;

public static class SeedData
{
    public static List<Place> Places => new()
    {
        new Place { Id=1, Name="Hoan Kiem Lake", Description="Iconic lake in the heart of Hanoi.", Category="Nature", Address="Hoan Kiem District", Latitude=21.0285, Longitude=105.8522, TicketPrice=0 },
        new Place { Id=2, Name="Old Quarter", Description="Historic streets, food and culture.", Category="Culture", Address="Hoan Kiem District", Latitude=21.0340, Longitude=105.8500, TicketPrice=0 },
        new Place { Id=3, Name="Temple of Literature", Description="Vietnam's first national university.", Category="History", Address="Dong Da District", Latitude=21.0281, Longitude=105.8357, TicketPrice=70000 },
        new Place { Id=4, Name="One Pillar Pagoda", Description="Historic Buddhist temple.", Category="Religion", Address="Ba Dinh District", Latitude=21.0368, Longitude=105.8347, TicketPrice=25000 },
        new Place { Id=5, Name="Hanoi Opera House", Description="French colonial architecture landmark.", Category="Architecture", Address="Hoan Kiem District", Latitude=21.0245, Longitude=105.8574, TicketPrice=120000 }
    };
}

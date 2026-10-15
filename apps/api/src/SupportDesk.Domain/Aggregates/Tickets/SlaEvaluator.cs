namespace SupportDesk.Domain.Aggregates.Tickets;

public static class SlaEvaluator
{
    public static SlaStatus Evaluate(DateTime? dueAtUtc, DateTime? resolvedAtUtc, DateTime nowUtc)
    {
        if (dueAtUtc is null)
        {
            return SlaStatus.NotApplicable;
        }

        if (resolvedAtUtc is not null)
        {
            return resolvedAtUtc <= dueAtUtc ? SlaStatus.Met : SlaStatus.Breached;
        }

        if (nowUtc > dueAtUtc)
        {
            return SlaStatus.Breached;
        }

        return SlaStatus.WithinSla;
    }

    public static DateTime CalculateDueDate(DateTime createdAtUtc, TicketPriority priority, bool isPremium)
    {
        int baseHours = priority switch
        {
            TicketPriority.Critical => 4,
            TicketPriority.High => 8,
            TicketPriority.Medium => 24,
            TicketPriority.Low => 72,
            _ => 24
        };

        double multiplier = isPremium ? 0.5 : 1.0;
        double hours = Math.Max(1.0, baseHours * multiplier); // 1-hour floor (BR-3)

        return createdAtUtc.AddHours(hours);
    }
}

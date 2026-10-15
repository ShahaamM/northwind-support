using System.Linq.Expressions;

namespace SupportDesk.Infrastructure.Queries;

internal static class QueryableExtensions
{
    /// <summary>
    /// Adds the predicate only when <paramref name="condition"/> holds, so optional filters stay
    /// one readable line each and an absent filter contributes nothing to the SQL.
    /// </summary>
    public static IQueryable<T> WhereIf<T>(
        this IQueryable<T> source,
        bool condition,
        Expression<Func<T, bool>> predicate) =>
        condition ? source.Where(predicate) : source;
}

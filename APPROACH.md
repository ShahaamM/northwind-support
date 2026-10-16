---

### 2. `APPROACH.md`

```markdown
# Engineering Approach & Thought Process: Northwind Support Desk

This document details the step-by-step approach and thought process used to implement the four tasks of the Northwind Support Desk assignment.

---

## Overall Mindset & Approach

Coming into this assignment, working across a full-stack environment with .NET 10 Clean Architecture, React 19, SQL Server, and Docker simultaneously was quite challenging. Since I wasn't deeply familiar with every single pattern upfront, my approach relied heavily on breaking each task down into manageable pieces, relying on structured documentation, and using AI as an interactive mentor to explain error messages, guide debugging sessions, and verify logic step-by-step.

---

## Task 1: Defect Fix & Server-Side Filtering

* **Thought Process on DEFECT-117**: The bug report noted that changing the status dropdown didn't trigger API requests properly. I traced the React state hooks and event handlers to locate where state updates were dropping async updates. Fixing the hook binding ensured that changing filters immediately triggered fresh requests without race conditions.
* **Thought Process on Server-Side Filtering**: Initially, I considered filtering records in-memory after loading them into C#, but realized that would break pagination and performance. Working with the application architecture, I mapped query parameters (`status`, `priority`, `categoryId`, etc.) directly into `TicketQueries.cs` using EF Core LINQ expressions so SQL Server handles all filtering, counting, and paging (`FL-5`).

---

## Task 2: Ticket Escalation & Assignment

* **Thought Process on Triage & SLA**: The business rules (`BR-1` to `BR-6`) required precise calculations for priority overrides, SLA windows, premium customer halvings, and the 1-hour floor. I encapsulated this logic inside `SlaEvaluator.cs` so it could be cleanly tested and shared between ticket creation and escalation.
* **Thought Process on Agent Assignment & Escalation**: Implementing load balancing (fewest open tickets below capacity limits) required careful LINQ query construction. For escalations, ensuring that critical or resolved/closed tickets return proper `409 Conflict` responses while writing immutable audit history rows to `TicketEscalations` required adding a new database migration and verifying foreign key constraints.

---

## Task 3: Login & Authentication

* **Thought Process on Backend Auth**: Security and JWTs felt daunting at first. I learned how to configure ASP.NET Core `JwtBearer` authentication, use the built-in `PasswordHasher` for secure credential storage (`AU-2`), and protect endpoints centrally using `[Authorize]` attributes. I also made sure the actor (`escalatedBy`) was pulled securely from the JWT claims rather than request bodies (`AU-8`).
* **Thought Process on Frontend Auth**: For the React side, storing tokens in `localStorage` and attaching them via an Axios request interceptor (`client.ts`) provided a clean way to authenticate requests. Setting up protected routes to catch `401` errors and redirect expired sessions to `/login` ensured a smooth user experience.

---

## Task 4: Dockerisation

* **Thought Process on Dockerfile**: Writing the multi-stage `Dockerfile` (`apps/api/Dockerfile`) was about separating heavy SDK compilation tools from the lightweight runtime image (`DK-1`). Caching package restores by copying project and solution files first was a crucial optimization.
* **Thought Process on Docker Compose**: Orchestrating SQL Server and the API required robust container health checks (`DK-5`). Setting `condition: service_healthy` ensured the API didn't attempt to run EF Core migrations before SQL Server was fully ready to accept connections. Verifying non-root execution (`appuser`) via `docker compose exec api whoami` completed the security requirements (`DK-3`).

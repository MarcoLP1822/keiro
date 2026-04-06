# Keiro (経路) — Project Instructions

## Development Principles

Every implementation must respect these principles:

| Principle | Description |
|-----------|-------------|
| **DRY Compliant** | Maximize code reuse. No duplication. |
| **Best Practices** | Follow web development and software engineering best practices |
| **Critical & Accurate** | Evaluate every change critically. No "quick & dirty" solutions |
| **Production Ready** | The app must be production-ready, not a prototype |
| **Backward Compatible** | Zero breaking changes. Existing features must keep working |
| **Clean Architecture** | Separation of concerns, readable and maintainable code |
| **State of the Art** | Use modern, proven patterns and technologies |
| **Solve, Don't Work Around** | Fix the root cause, whatever it takes. The only limit is not breaking the app |
| **TDD** | Test-Driven Development. Write tests first, then implement |

## Error Handling Philosophy: Fail Loud, Never Fake

Prefer a visible failure over a silent fallback.

- Never silently swallow errors to keep things "working."
  Surface the error. Don't substitute placeholder data.
- Fallbacks are acceptable only when disclosed. Show a
  banner, log a warning, annotate the output.
- Design for debuggability, not cosmetic stability.

Priority order:
1. Works correctly with real data
2. Falls back visibly — clearly signals degraded mode
3. Fails with a clear error message
4. Silently degrades to look "fine" — never do this

## Before Implementing Any Feature

1. Does code already exist that does something similar? → Reuse or extend it
2. Does this change break anything existing? → If yes, rethink
3. Is the code testable and maintainable? → If not, refactor
4. Would another developer understand this code? → If not, document or simplify

from fastapi import HTTPException

VALID_STATUSES = frozenset({"Open", "In Progress", "Resolved", "Closed", "Cancelled"})

ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    "Open": frozenset({"In Progress", "Cancelled"}),
    "In Progress": frozenset({"Resolved", "Cancelled"}),
    "Resolved": frozenset({"Closed"}),
    "Closed": frozenset(),
    "Cancelled": frozenset(),
}


def validate_status_transition(current: str, new: str) -> None:
    if new not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}.",
        )
    if current == new:
        return
    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if new not in allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status transition from '{current}' to '{new}'. "
                f"Allowed transitions: {', '.join(sorted(allowed)) or 'none'}."
            ),
        )

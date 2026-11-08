def can_book(start: int, end: int, now: int, blocked: bool, existing: list) -> bool:
    # AC1: candidate times are integer minutes after midnight with 0 <= start < end <= 1440,
    # and start must be strictly after now.
    if not isinstance(start, int) or isinstance(start, bool):
        return False
    if not isinstance(end, int) or isinstance(end, bool):
        return False
    if not isinstance(now, int) or isinstance(now, bool):
        return False
    if not (0 <= start < end <= 1440):
        return False
    if not (start > now):
        return False

    # AC2: duration must not exceed 120 minutes; exactly 120 is permitted.
    if (end - start) > 120:
        return False

    # AC3: reject every request when the selected room is blocked.
    if blocked:
        return False

    # AC4: reject overlap with any existing booking; intervals touching at an
    # endpoint (start == e or end == s) do NOT overlap and are allowed.
    for booking in existing:
        s, e = booking[0], booking[1]
        if start < e and end > s:
            return False

    return True

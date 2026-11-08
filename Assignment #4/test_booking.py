import copy
import unittest

from booking import can_book


class TestCanBook(unittest.TestCase):
    """Test suite for can_book using base values: now=540, blocked=False, existing=[(600, 660)]."""

    def setUp(self):
        self.now = 540
        self.blocked = False
        self.existing = [(600, 660)]

    # ── happy-path / boundary ────────────────────────────────────────

    def test_touching_endpoints_allowed(self):
        self.assertTrue(can_book(660, 720, self.now, self.blocked, self.existing))

    def test_overlap_rejected(self):
        self.assertFalse(can_book(630, 690, self.now, self.blocked, self.existing))

    def test_blocked_room(self):
        self.assertFalse(can_book(660, 720, self.now, True, self.existing))

    def test_exactly_two_hours(self):
        self.assertTrue(can_book(720, 840, self.now, self.blocked, self.existing))

    def test_over_two_hours(self):
        self.assertFalse(can_book(720, 841, self.now, self.blocked, self.existing))

    # ── AC1 edge cases ───────────────────────────────────────────────

    def test_starts_at_now(self):
        self.assertFalse(can_book(540, 570, self.now, self.blocked, self.existing))

    def test_reversed_times(self):
        self.assertFalse(can_book(720, 660, self.now, self.blocked, self.existing))

    def test_zero_start(self):
        self.assertFalse(can_book(0, 60, 0, self.blocked, self.existing))

    def test_end_exceeds_day(self):
        self.assertFalse(can_book(1400, 1500, self.now, self.blocked, self.existing))

    def test_start_equals_end(self):
        self.assertFalse(can_book(660, 660, self.now, self.blocked, self.existing))

    # ── existing-list variations ─────────────────────────────────────

    def test_empty_bookings(self):
        self.assertTrue(can_book(660, 720, self.now, self.blocked, []))

    def test_multiple_bookings(self):
        self.assertTrue(can_book(660, 720, self.now, self.blocked, [(600, 660), (720, 780)]))

    # ── contract / safety ────────────────────────────────────────────

    def test_input_unchanged(self):
        original = copy.deepcopy(self.existing)
        result = can_book(660, 720, self.now, self.blocked, self.existing)
        self.assertTrue(result)
        self.assertEqual(self.existing, original)

    def test_return_type(self):
        result = can_book(660, 720, self.now, self.blocked, self.existing)
        self.assertIsInstance(result, bool)


if __name__ == "__main__":
    unittest.main()

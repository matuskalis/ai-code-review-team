"""Simple in-memory rate limiter for code review requests"""

from datetime import datetime, timedelta
from typing import Dict, Tuple
import threading


class RateLimiter:
    """
    Simple in-memory rate limiter that tracks requests by IP address.
    Resets daily at midnight.
    """

    def __init__(self, max_requests_per_day: int = 5):
        self.max_requests_per_day = max_requests_per_day
        self.request_counts: Dict[str, Tuple[int, datetime]] = {}
        self.lock = threading.Lock()

    def _get_today_key(self) -> str:
        """Get a date string for today (used for daily reset)"""
        return datetime.now().strftime("%Y-%m-%d")

    def _clean_old_entries(self):
        """Remove entries from previous days"""
        today = self._get_today_key()
        with self.lock:
            keys_to_remove = []
            for ip, (count, date) in self.request_counts.items():
                if date.strftime("%Y-%m-%d") != today:
                    keys_to_remove.append(ip)

            for key in keys_to_remove:
                del self.request_counts[key]

    def check_rate_limit(self, ip_address: str) -> Tuple[bool, int, int]:
        """
        Check if IP address has exceeded rate limit.

        Returns:
            Tuple of (allowed: bool, requests_used: int, requests_remaining: int)
        """
        self._clean_old_entries()

        today = datetime.now()

        with self.lock:
            if ip_address not in self.request_counts:
                # First request today
                self.request_counts[ip_address] = (1, today)
                return (True, 1, self.max_requests_per_day - 1)

            count, last_request_date = self.request_counts[ip_address]

            # Check if it's the same day
            if last_request_date.strftime("%Y-%m-%d") == today.strftime("%Y-%m-%d"):
                if count >= self.max_requests_per_day:
                    # Rate limit exceeded
                    return (False, count, 0)
                else:
                    # Increment counter
                    self.request_counts[ip_address] = (count + 1, today)
                    return (True, count + 1, self.max_requests_per_day - count - 1)
            else:
                # New day, reset counter
                self.request_counts[ip_address] = (1, today)
                return (True, 1, self.max_requests_per_day - 1)

    def get_stats(self) -> Dict:
        """Get current rate limiter statistics"""
        self._clean_old_entries()

        with self.lock:
            return {
                "total_ips_tracked": len(self.request_counts),
                "max_requests_per_day": self.max_requests_per_day,
                "current_date": self._get_today_key()
            }


# Global rate limiter instance
rate_limiter = RateLimiter(max_requests_per_day=5)

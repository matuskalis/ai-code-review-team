"""Enhanced in-memory rate limiter with tiered limits and burst allowance"""

from datetime import datetime, timedelta
from typing import Dict, Tuple, List
import threading


class RateLimiter:
    """
    Enhanced rate limiter that tracks requests by IP address.
    Features:
    - Daily and hourly limits
    - Burst allowance for better UX
    - Automatic cleanup of old entries
    - Sliding window for hourly limits
    """

    def __init__(
        self,
        max_requests_per_day: int = 5,
        max_requests_per_hour: int = 3,
        burst_allowance: int = 2
    ):
        self.max_requests_per_day = max_requests_per_day
        self.max_requests_per_hour = max_requests_per_hour
        self.burst_allowance = burst_allowance

        # Store: ip -> {day_count, day_date, hourly_requests: [(timestamp, count)]}
        self.request_counts: Dict[str, Dict] = {}
        self.lock = threading.Lock()

    def _get_today_key(self) -> str:
        """Get a date string for today (used for daily reset)"""
        return datetime.now().strftime("%Y-%m-%d")

    def _clean_old_entries(self):
        """Remove entries from previous days and old hourly data"""
        today = self._get_today_key()
        one_hour_ago = datetime.now() - timedelta(hours=1)

        with self.lock:
            keys_to_remove = []
            for ip, data in self.request_counts.items():
                # Remove if from previous day
                if data.get("day_date", "").strftime("%Y-%m-%d") != today:
                    keys_to_remove.append(ip)
                else:
                    # Clean old hourly requests (> 1 hour old)
                    data["hourly_requests"] = [
                        (ts, count) for ts, count in data.get("hourly_requests", [])
                        if ts > one_hour_ago
                    ]

            for key in keys_to_remove:
                del self.request_counts[key]

    def _get_hourly_count(self, ip_address: str) -> int:
        """Get number of requests in the last hour"""
        one_hour_ago = datetime.now() - timedelta(hours=1)

        if ip_address not in self.request_counts:
            return 0

        hourly_requests = self.request_counts[ip_address].get("hourly_requests", [])
        return sum(count for ts, count in hourly_requests if ts > one_hour_ago)

    def check_rate_limit(self, ip_address: str) -> Tuple[bool, int, int, str]:
        """
        Check if IP address has exceeded rate limit.

        Returns:
            Tuple of (
                allowed: bool,
                requests_used_today: int,
                requests_remaining_today: int,
                reason: str (if blocked)
            )
        """
        self._clean_old_entries()

        today = datetime.now()
        today_key = self._get_today_key()

        with self.lock:
            # Initialize tracking for new IP
            if ip_address not in self.request_counts:
                self.request_counts[ip_address] = {
                    "day_count": 1,
                    "day_date": today,
                    "hourly_requests": [(today, 1)]
                }
                return (True, 1, self.max_requests_per_day - 1, "")

            data = self.request_counts[ip_address]

            # Check if it's a new day
            if data["day_date"].strftime("%Y-%m-%d") != today_key:
                # New day, reset counters
                self.request_counts[ip_address] = {
                    "day_count": 1,
                    "day_date": today,
                    "hourly_requests": [(today, 1)]
                }
                return (True, 1, self.max_requests_per_day - 1, "")

            # Check hourly limit (with burst allowance)
            hourly_count = self._get_hourly_count(ip_address)
            hourly_limit_with_burst = self.max_requests_per_hour + self.burst_allowance

            if hourly_count >= hourly_limit_with_burst:
                return (
                    False,
                    data["day_count"],
                    max(0, self.max_requests_per_day - data["day_count"]),
                    f"Hourly limit exceeded ({hourly_count}/{self.max_requests_per_hour} per hour). Please wait a few minutes."
                )

            # Check daily limit
            if data["day_count"] >= self.max_requests_per_day:
                return (
                    False,
                    data["day_count"],
                    0,
                    f"Daily limit exceeded ({data['day_count']}/{self.max_requests_per_day} per day). Resets at midnight UTC."
                )

            # Increment counters
            data["day_count"] += 1
            data["hourly_requests"].append((today, 1))

            return (
                True,
                data["day_count"],
                self.max_requests_per_day - data["day_count"],
                ""
            )

    def get_status(self, ip_address: str) -> Dict:
        """Get current status for an IP address"""
        self._clean_old_entries()

        with self.lock:
            if ip_address not in self.request_counts:
                return {
                    "requests_today": 0,
                    "requests_remaining_today": self.max_requests_per_day,
                    "requests_last_hour": 0,
                    "hourly_limit": self.max_requests_per_hour,
                    "daily_limit": self.max_requests_per_day
                }

            data = self.request_counts[ip_address]
            hourly_count = self._get_hourly_count(ip_address)

            return {
                "requests_today": data["day_count"],
                "requests_remaining_today": max(0, self.max_requests_per_day - data["day_count"]),
                "requests_last_hour": hourly_count,
                "hourly_limit": self.max_requests_per_hour,
                "daily_limit": self.max_requests_per_day,
                "reset_time": datetime.now().replace(
                    hour=23, minute=59, second=59, microsecond=999999
                ).isoformat()
            }

    def get_stats(self) -> Dict:
        """Get current rate limiter statistics"""
        self._clean_old_entries()

        with self.lock:
            return {
                "total_ips_tracked": len(self.request_counts),
                "max_requests_per_day": self.max_requests_per_day,
                "max_requests_per_hour": self.max_requests_per_hour,
                "burst_allowance": self.burst_allowance,
                "current_date": self._get_today_key()
            }


# Global rate limiter instance with enhanced limits
rate_limiter = RateLimiter(
    max_requests_per_day=5,
    max_requests_per_hour=3,
    burst_allowance=2
)

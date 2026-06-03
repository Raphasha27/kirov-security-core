import time
from collections import defaultdict, deque
from typing import List, Dict

class Event:
    def __init__(self, event_type: str, source: str, detail: str = "", timestamp: float = None):
        self.event_type = event_type
        self.source = source
        self.detail = detail
        self.timestamp = timestamp or time.time()

    def to_dict(self) -> dict:
        return {
            "event_type": self.event_type,
            "source": self.source,
            "detail": self.detail,
            "timestamp": self.timestamp,
        }


class AnomalyDetector:
    def __init__(self):
        self.events: List[Event] = []
        self.brute_force_window: deque = deque(maxlen=200)
        self.port_scan_window: deque = deque(maxlen=500)

    def record_event(self, event_type: str, source: str, detail: str = ""):
        ev = Event(event_type, source, detail)
        self.events.append(ev)
        if event_type == "failed_login":
            self.brute_force_window.append((source, ev.timestamp))
        elif event_type == "port_access":
            self.port_scan_window.append((source, detail, ev.timestamp))

    def check_brute_force(self) -> List[dict]:
        alerts = []
        now = time.time()
        attempts: Dict[str, int] = defaultdict(int)
        for src, ts in self.brute_force_window:
            if now - ts < 60:
                attempts[src] += 1
        for src, count in attempts.items():
            if count > 5:
                alerts.append({
                    "title": f"Brute Force Detected from {src}",
                    "severity": "high",
                    "source": "detector",
                    "message": f"{count} failed login attempts from {src} in the last 60 seconds.",
                })
        return alerts

    def check_port_scan(self) -> List[dict]:
        alerts = []
        now = time.time()
        src_ports: Dict[str, set] = defaultdict(set)
        for src, port, ts in self.port_scan_window:
            if now - ts < 300:
                src_ports[src].add(port)
        for src, ports in src_ports.items():
            if len(ports) > 10:
                alerts.append({
                    "title": f"Port Scanning Detected from {src}",
                    "severity": "medium",
                    "source": "detector",
                    "message": f"{len(ports)} unique ports accessed from {src} in the last 5 minutes.",
                })
        return alerts

    def analyze(self) -> List[dict]:
        alerts = []
        alerts.extend(self.check_brute_force())
        alerts.extend(self.check_port_scan())
        return alerts


detector = AnomalyDetector()

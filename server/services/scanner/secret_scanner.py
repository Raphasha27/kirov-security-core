import re
import os
from typing import List

class SecretFinding:
    def __init__(self, severity: str, secret_type: str, location: str, line: int, snippet: str = ""):
        self.severity = severity
        self.secret_type = secret_type
        self.location = location
        self.line = line
        self.snippet = snippet

    def to_dict(self) -> dict:
        return {
            "severity": self.severity,
            "secret_type": self.secret_type,
            "location": self.location,
            "line": self.line,
            "snippet": self.snippet,
        }


SECRET_PATTERNS = [
    (r'AKIA[0-9A-Z]{16}', "critical", "AWS Access Key"),
    (r'(?:ghp_|ghs_|ghu_|gho_|ghr_)[0-9A-Za-z]{36}', "critical", "GitHub Token"),
    (r'sk-[A-Za-z0-9]{32,}', "critical", "OpenAI API Key"),
    (r'-----BEGIN\s*(?:RSA\s+)?PRIVATE\s+KEY-----', "critical", "Private Key"),
    (r'(?i)(?:password|passwd|pwd|secret|token|api[_-]?key)\s*[=:]\s*["\'][^"\']{8,}["\']', "high", "Generic Secret"),
]


def scan_for_secrets(file_path: str) -> List[SecretFinding]:
    findings: List[SecretFinding] = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception:
        return findings

    for lineno, line in enumerate(lines, 1):
        for pattern, severity, secret_type in SECRET_PATTERNS:
            if re.search(pattern, line):
                findings.append(SecretFinding(severity, secret_type, file_path, lineno, line.strip()))

    return findings


def scan_path_for_secrets(path: str) -> List[SecretFinding]:
    findings: List[SecretFinding] = []
    if os.path.isfile(path):
        return scan_for_secrets(path)
    for root, _, files in os.walk(path):
        for fname in files:
            fpath = os.path.join(root, fname)
            try:
                findings.extend(scan_for_secrets(fpath))
            except Exception:
                continue
    return findings

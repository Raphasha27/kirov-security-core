import re
import os
from typing import List, Optional

class Finding:
    def __init__(self, severity: str, title: str, file: str, line: int, remediation: str, snippet: str = ""):
        self.severity = severity
        self.title = title
        self.file = file
        self.line = line
        self.remediation = remediation
        self.snippet = snippet

    def to_dict(self) -> dict:
        return {
            "severity": self.severity,
            "title": self.title,
            "file": self.file,
            "line": self.line,
            "remediation": self.remediation,
            "snippet": self.snippet,
        }

SECRET_PATTERNS = [
    (r'(?i)(?:api[_-]?key|apikey)\s*[=:]\s*["\'][^"\']+["\']', "high", "Hardcoded API Key", "Move to environment variables or a secrets manager."),
    (r'(?i)(?:password|passwd|pwd)\s*[=:]\s*["\'][^"\']+["\']', "critical", "Hardcoded Password", "Use a secrets vault or environment variables."),
    (r'(?i)(?:token|secret)\s*[=:]\s*["\'][^"\']+["\']', "high", "Hardcoded Token/Secret", "Store tokens in environment variables."),
    (r'(?i)-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----', "critical", "Embedded Private Key", "Remove private keys from source code."),
]

WEAK_CRYPTO_PATTERNS = [
    (r'(?i)\bMD5\b', "medium", "Weak Hash: MD5", "Use SHA-256 or SHA-3 instead of MD5."),
    (r'(?i)\bSHA1\b', "medium", "Weak Hash: SHA-1", "Use SHA-256 or SHA-3 instead of SHA-1."),
    (r'(?i)\bDES\b', "high", "Weak Cipher: DES", "Use AES-256 instead of DES."),
    (r'(?i)\bRC4\b', "high", "Weak Cipher: RC4", "Use AES-256 instead of RC4."),
]

INJECTION_PATTERNS = [
    (r'(?i)(?:SELECT|INSERT|UPDATE|DELETE).*\+.*(?:request|input|user|param)', "high", "Possible SQL Injection", "Use parameterized queries or an ORM."),
    (r'(?i)(?:os\.system|subprocess\.call|subprocess\.Popen|exec)\s*\(', "critical", "Command Injection Risk", "Avoid running shell commands with user input; use safe APIs."),
    (r'(?i)(?:eval|exec)\s*\(', "critical", "Insecure Deserialization", "Avoid eval/exec with untrusted data."),
    (r'(?i)(?:pickle\.loads|yaml\.load\b)(?!.*SafeLoader)', "high", "Insecure Deserialization", "Use safe_load or a safer serialization format."),
]


def scan_file(file_path: str) -> List[Finding]:
    findings: List[Finding] = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception:
        return findings

    for lineno, line in enumerate(lines, 1):
        for pattern, severity, title, remediation in SECRET_PATTERNS:
            if re.search(pattern, line):
                findings.append(Finding(severity, title, file_path, lineno, remediation, line.strip()))
        for pattern, severity, title, remediation in WEAK_CRYPTO_PATTERNS:
            if re.search(pattern, line):
                findings.append(Finding(severity, title, file_path, lineno, remediation, line.strip()))
        for pattern, severity, title, remediation in INJECTION_PATTERNS:
            if re.search(pattern, line):
                findings.append(Finding(severity, title, file_path, lineno, remediation, line.strip()))

    return findings


def scan_directory(path: str, extensions: Optional[List[str]] = None) -> List[Finding]:
    if extensions is None:
        extensions = [".py", ".js", ".ts", ".java", ".go", ".rb", ".php", ".sh", ".env"]
    findings: List[Finding] = []
    if not os.path.isdir(path):
        findings.extend(scan_file(path))
        return findings
    for root, _, files in os.walk(path):
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext in extensions or not extensions:
                fpath = os.path.join(root, fname)
                try:
                    findings.extend(scan_file(fpath))
                except Exception:
                    continue
    return findings


def calculate_risk_score(findings: List[Finding]) -> float:
    severity_map = {"low": 1, "medium": 3, "high": 7, "critical": 10}
    total = sum(severity_map.get(f.severity, 0) for f in findings)
    return min(round(total / max(len(findings), 1), 1), 10.0)

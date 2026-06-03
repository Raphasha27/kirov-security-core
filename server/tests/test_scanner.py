import pytest
import os
import tempfile
from services.scanner.code_scanner import scan_file, scan_directory, calculate_risk_score, Finding
from services.scanner.secret_scanner import scan_for_secrets, scan_path_for_secrets


class TestCodeScanner:

    def test_scan_file_no_findings(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write("x = 1\ny = 2\nprint(x + y)\n")
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) == 0
        finally:
            os.unlink(fpath)

    def test_scan_file_hardcoded_password(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('password = "super-secret-123"\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("Password" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_file_api_key(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('API_KEY = "sk-abc123def456"\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("API Key" in f.title or "Token" in f.title or "Secret" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_file_weak_crypto_md5(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('import hashlib; h = hashlib.md5(b"test")\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("MD5" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_file_sql_injection(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('query = "SELECT * FROM users WHERE id = " + user_input + "\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("SQL" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_file_command_injection(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('import os; os.system("rm -rf " + user_path)\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("Command" in f.title or "Injection" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_file_eval(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write('result = eval(user_input)\n')
            fpath = f.name
        try:
            findings = scan_file(fpath)
            assert len(findings) >= 1
            assert any("eval" in f.title.lower() or "Injection" in f.title or "Insecure" in f.title for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_directory(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            f1 = os.path.join(tmpdir, "test1.py")
            f2 = os.path.join(tmpdir, "test2.py")
            with open(f1, "w") as f:
                f.write('password = "secret"\n')
            with open(f2, "w") as f:
                f.write('x = 1\n')
            findings = scan_directory(tmpdir)
            assert len(findings) >= 1

    def test_risk_score_no_findings(self):
        assert calculate_risk_score([]) == 0.0

    def test_risk_score_with_findings(self):
        findings = [
            Finding("low", "Test low", "f.py", 1, "fix"),
            Finding("critical", "Test crit", "f.py", 2, "fix"),
        ]
        score = calculate_risk_score(findings)
        assert 0 < score <= 10


class TestSecretScanner:

    def test_scan_aws_key(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".env", delete=False) as f:
            f.write('AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n')
            fpath = f.name
        try:
            findings = scan_for_secrets(fpath)
            assert len(findings) >= 1
            assert any("AWS" in f.secret_type for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_github_token(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".env", delete=False) as f:
            f.write('GITHUB_TOKEN=ghp_123456789012345678901234567890123456\n')
            fpath = f.name
        try:
            findings = scan_for_secrets(fpath)
            assert len(findings) >= 1
            assert any("GitHub" in f.secret_type for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_private_key(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".pem", delete=False) as f:
            f.write('-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFA\n-----END PRIVATE KEY-----\n')
            fpath = f.name
        try:
            findings = scan_for_secrets(fpath)
            assert len(findings) >= 1
            assert any("Private Key" in f.secret_type for f in findings)
        finally:
            os.unlink(fpath)

    def test_scan_path_secrets(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            fpath = os.path.join(tmpdir, "creds.txt")
            with open(fpath, "w") as f:
                f.write('token = "ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"\n')
            findings = scan_path_for_secrets(tmpdir)
            assert len(findings) >= 1

    def test_no_secrets(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("hello world\n")
            fpath = f.name
        try:
            findings = scan_for_secrets(fpath)
            assert len(findings) == 0
        finally:
            os.unlink(fpath)

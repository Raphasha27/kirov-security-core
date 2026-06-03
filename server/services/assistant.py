import logging
from typing import List, Dict, Any, Optional
from core.config import settings

logger = logging.getLogger("kirov")

def _rule_based_analysis(findings: List[Dict]) -> Dict[str, Any]:
    if not findings:
        return {
            "summary": "No security findings detected.",
            "risk_level": "low",
            "risk_score": 0.0,
            "recommendations": [],
            "findings_count": 0,
        }

    severity_map = {"low": 1, "medium": 3, "high": 7, "critical": 10}
    total_score = sum(severity_map.get(f.get("severity", "low"), 1) for f in findings)
    avg_score = round(total_score / len(findings), 1)
    risk_score = min(round(avg_score * (len(findings) ** 0.3) / 2, 1), 10.0)

    critical_count = sum(1 for f in findings if f.get("severity") == "critical")
    high_count = sum(1 for f in findings if f.get("severity") == "high")

    if risk_score >= 7:
        risk_level = "critical"
    elif risk_score >= 4:
        risk_level = "high"
    elif risk_score >= 2:
        risk_level = "medium"
    else:
        risk_level = "low"

    types = {}
    for f in findings:
        t = f.get("title", "Unknown")
        types[t] = types.get(t, 0) + 1
    top_types = sorted(types.items(), key=lambda x: -x[1])[:5]

    recommendations = []
    if critical_count > 0:
        recommendations.append(f"Address {critical_count} critical finding(s) immediately.")
    if high_count > 0:
        recommendations.append(f"Review and fix {high_count} high-severity issue(s).")
    if any("API Key" in f.get("title", "") for f in findings):
        recommendations.append("Rotate exposed API keys and move them to environment variables.")
    if any("SQL" in f.get("title", "") for f in findings):
        recommendations.append("Use parameterized queries to prevent SQL injection.")
    if any("Private Key" in f.get("title", "") for f in findings):
        recommendations.append("Remove private keys from source code and revoke compromised keys.")
    if not recommendations:
        recommendations.append("Continue monitoring and follow security best practices.")

    severity_counts = {"critical": critical_count, "high": high_count,
                       "medium": sum(1 for f in findings if f.get("severity") == "medium"),
                       "low": sum(1 for f in findings if f.get("severity") == "low")}

    return {
        "summary": f"Analysis complete: found {len(findings)} issue(s) across {len(top_types)} categories. "
                    f"Risk score: {risk_score}/10 ({risk_level.upper()}).",
        "risk_level": risk_level,
        "risk_score": risk_score,
        "severity_breakdown": severity_counts,
        "top_finding_types": [{"type": t, "count": c} for t, c in top_types],
        "recommendations": recommendations,
        "findings_count": len(findings),
    }


async def analyze_findings(findings: List[Dict]) -> Dict[str, Any]:
    if settings.openai_api_key:
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            }
            findings_summary = "\n".join(
                f"- [{f.get('severity', 'N/A').upper()}] {f.get('title', 'Unknown')} in {f.get('file', '?')}:{f.get('line', '?')}"
                for f in findings[:50]
            )
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a security analysis assistant. Analyze the findings and provide a concise summary, risk level (low/medium/high/critical), risk score (0-10), and actionable recommendations."},
                    {"role": "user", "content": f"Analyze these security findings:\n{findings_summary}"},
                ],
                "temperature": 0.3,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    return {
                        "summary": content,
                        "risk_level": "unknown",
                        "risk_score": 0.0,
                        "recommendations": ["Review AI-generated analysis."],
                        "findings_count": len(findings),
                        "ai_analyzed": True,
                    }
        except Exception as e:
            logger.warning(f"OpenAI API call failed, falling back to rule-based: {e}")

    return _rule_based_analysis(findings)


def generate_chat_response(query: str, context: Optional[str] = None) -> str:
    query_lower = query.lower()
    if "sql injection" in query_lower:
        return "SQL injection occurs when untrusted data is sent to an interpreter as part of a query. Use parameterized queries, stored procedures, or an ORM to prevent it. Always validate and sanitize inputs."
    if "xss" in query_lower or "cross site" in query_lower:
        return "Cross-site scripting (XSS) allows attackers to inject client-side scripts. Mitigate by escaping output, using Content Security Policy headers, and validating input."
    if "authentication" in query_lower or "auth" in query_lower:
        return "Use strong password hashing (bcrypt), implement MFA, enforce rate limiting on login endpoints, and use JWT with short expiration times."
    if "secret" in query_lower or "key" in query_lower:
        return "Never hardcode secrets in source code. Use environment variables or a secrets manager like HashiCorp Vault. Rotate keys regularly."
    return "I'm a security assistant. I can help with topics like SQL injection, XSS, authentication, secrets management, and security best practices. Please ask a specific security question."


async def get_security_suggestions() -> List[str]:
    return [
        "Enable multi-factor authentication for all admin accounts.",
        "Implement rate limiting on all API endpoints (recommended: 60 req/min).",
        "Use Content Security Policy (CSP) headers to prevent XSS attacks.",
        "Run dependency vulnerability scans (e.g., pip audit, npm audit) regularly.",
        "Enable audit logging for all security-relevant events.",
        "Use HTTPS with valid TLS certificates everywhere.",
        "Implement proper session management with short token expiration.",
        "Regularly review and rotate API keys and credentials.",
        "Keep all dependencies updated to patch known vulnerabilities.",
        "Implement network segmentation to limit lateral movement.",
    ]

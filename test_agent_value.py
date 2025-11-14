#!/usr/bin/env python3
"""Test that each agent provides unique, valuable insights"""
import requests
import json

def test_security_value():
    """Test Security Agent detects real vulnerabilities"""
    print("=" * 60)
    print("VALIDATION 2.1: Security Agent Value")
    print("=" * 60)

    # Test SQL Injection
    code = """
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query).fetchone()
"""

    response = requests.post(
        "http://localhost:8000/review",
        json={"code": code, "language": "python"},
        timeout=90
    )
    data = response.json()

    security_agent = next((a for a in data['agent_reviews'] if a['agent_type'] == 'security'), None)
    security_issues = security_agent['issues'] if security_agent else []

    checks = {
        "Security agent found issues": len(security_issues) > 0,
        "Found SQL injection (CWE-89)": any("CWE-89" in issue['issue'] or "SQL injection" in issue['issue'] for issue in security_issues),
        "Issue marked as critical/high": any(issue['severity'] in ['critical', 'high'] for issue in security_issues),
        "Provides specific fix": any(len(issue['suggestion']) > 50 for issue in security_issues),
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    if security_issues:
        print(f"\nSample Security Issue:")
        issue = security_issues[0]
        print(f"  Severity: {issue['severity']}")
        print(f"  Issue: {issue['issue'][:100]}...")
        print(f"  Has actionable fix: {len(issue['suggestion']) > 50}")

def test_performance_value():
    """Test Performance Agent detects real inefficiencies"""
    print("\n" + "=" * 60)
    print("VALIDATION 2.2: Performance Agent Value")
    print("=" * 60)

    # Test N+1 query problem
    code = """
def get_user_posts(user_ids):
    results = []
    for user_id in user_ids:
        posts = db.execute(f"SELECT * FROM posts WHERE user_id = {user_id}").fetchall()
        results.append(posts)
    return results
"""

    response = requests.post(
        "http://localhost:8000/review",
        json={"code": code, "language": "python"},
        timeout=90
    )
    data = response.json()

    perf_agent = next((a for a in data['agent_reviews'] if a['agent_type'] == 'performance'), None)
    perf_issues = perf_agent['issues'] if perf_agent else []

    checks = {
        "Performance agent found issues": len(perf_issues) > 0,
        "Identified N+1 or complexity issue": any("N+1" in issue['issue'] or "O(" in issue['issue'] or "queries" in issue['issue'].lower() for issue in perf_issues),
        "Issue marked as high/medium": any(issue['severity'] in ['high', 'medium', 'critical'] for issue in perf_issues),
        "Provides optimization": any(len(issue['suggestion']) > 50 for issue in perf_issues),
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    if perf_issues:
        print(f"\nSample Performance Issue:")
        issue = perf_issues[0]
        print(f"  Severity: {issue['severity']}")
        print(f"  Issue: {issue['issue'][:100]}...")
        print(f"  Mentions Big-O or timing: {'O(' in issue['issue'] or 'ms' in issue['issue'] or 's at' in issue['issue']}")

def test_style_value():
    """Test Style Agent catches maintainability issues"""
    print("\n" + "=" * 60)
    print("VALIDATION 2.3: Style Agent Value")
    print("=" * 60)

    # Test deeply nested conditionals
    code = """
def complex_check(data):
    if data:
        if data.get('type') == 'user':
            if data.get('status') == 'active':
                if data.get('verified'):
                    if data.get('role') == 'admin':
                        return True
                    else:
                        return False
                else:
                    return False
            else:
                return False
        else:
            return False
    else:
        return False
"""

    response = requests.post(
        "http://localhost:8000/review",
        json={"code": code, "language": "python"},
        timeout=90
    )
    data = response.json()

    style_agent = next((a for a in data['agent_reviews'] if a['agent_type'] == 'style'), None)
    style_issues = style_agent['issues'] if style_agent else []

    checks = {
        "Style agent found issues": len(style_issues) > 0,
        "Identified complexity or nesting": any("complexity" in issue['issue'].lower() or "nested" in issue['issue'].lower() or "PEP" in issue['issue'] for issue in style_issues),
        "Provides refactoring suggestion": any(len(issue['suggestion']) > 30 for issue in style_issues),
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    if style_issues:
        print(f"\nSample Style Issue:")
        issue = style_issues[0]
        print(f"  Severity: {issue['severity']}")
        print(f"  Issue: {issue['issue'][:100]}...")
        print(f"  References standards: {'PEP' in issue['issue'] or 'complexity' in issue['issue'].lower()}")

def test_no_generic_fluff():
    """Test agents don't return generic responses for all inputs"""
    print("\n" + "=" * 60)
    print("VALIDATION 2.4: No Generic Fluff")
    print("=" * 60)

    # Test with clean, simple code
    code = """
def add(a: int, b: int) -> int:
    \"\"\"Add two numbers\"\"\"
    return a + b
"""

    response = requests.post(
        "http://localhost:8000/review",
        json={"code": code, "language": "python"},
        timeout=90
    )
    data = response.json()

    total_issues = data['total_issues']
    quality_score = data['quality_score']['overall_score']

    checks = {
        "Clean code has few/no issues": total_issues <= 2,
        "Quality score is high (>90)": quality_score >= 90,
        "Not all agents found issues": not all(len(a['issues']) > 0 for a in data['agent_reviews']),
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    print(f"\nClean code results:")
    print(f"  Total issues: {total_issues}")
    print(f"  Quality score: {quality_score}/100")
    print(f"  Grade: {data['quality_score']['grade']}")

if __name__ == "__main__":
    test_security_value()
    test_performance_value()
    test_style_value()
    test_no_generic_fluff()

    print("\n" + "=" * 60)
    print("✓ All Agent Value Validations Complete")
    print("=" * 60)

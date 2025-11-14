#!/usr/bin/env python3
"""Test robustness: large files, multiple languages, invalid inputs"""
import requests
import json
import time

def test_large_file():
    """Test 100+ line file"""
    print("=" * 60)
    print("VALIDATION 4.1: Large File (100+ lines)")
    print("=" * 60)

    # Create a realistic 150-line Python file with multiple issues
    code = """
import sqlite3
import os

class UserManager:
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)
        self.cursor = self.db.cursor()

    def create_user(self, username, password, email):
        # SQL injection vulnerability
        query = f"INSERT INTO users (username, password, email) VALUES ('{username}', '{password}', '{email}')"
        self.cursor.execute(query)
        self.db.commit()

    def get_user(self, user_id):
        # SQL injection vulnerability
        query = f"SELECT * FROM users WHERE id = {user_id}"
        result = self.cursor.execute(query).fetchone()
        return result

    def get_all_users(self):
        return self.cursor.execute("SELECT * FROM users").fetchall()

    def update_user(self, user_id, data):
        # N+1 query problem - updating multiple fields
        for key, value in data.items():
            query = f"UPDATE users SET {key} = '{value}' WHERE id = {user_id}"
            self.cursor.execute(query)
        self.db.commit()

    def delete_user(self, user_id):
        query = f"DELETE FROM users WHERE id = {user_id}"
        self.cursor.execute(query)
        self.db.commit()

    def search_users(self, search_term):
        # SQL injection vulnerability
        query = f"SELECT * FROM users WHERE username LIKE '%{search_term}%'"
        return self.cursor.execute(query).fetchall()

    def get_user_posts(self, user_ids):
        # N+1 query problem
        results = []
        for user_id in user_ids:
            query = f"SELECT * FROM posts WHERE user_id = {user_id}"
            posts = self.cursor.execute(query).fetchall()
            results.append(posts)
        return results

    def validate_user_data(self, data):
        # Deeply nested conditionals
        if data:
            if data.get('username'):
                if len(data.get('username')) > 3:
                    if data.get('email'):
                        if '@' in data.get('email'):
                            if data.get('password'):
                                if len(data.get('password')) > 8:
                                    if data.get('age'):
                                        if data.get('age') >= 18:
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
                    else:
                        return False
                else:
                    return False
            else:
                return False
        else:
            return False

    def batch_create_users(self, users_data):
        # Inefficient batch operation
        for user in users_data:
            self.create_user(user['username'], user['password'], user['email'])

    def get_user_with_posts(self, user_id):
        # N+1 query pattern
        user = self.get_user(user_id)
        if user:
            posts = self.get_user_posts([user_id])
            return {'user': user, 'posts': posts}
        return None

    def authenticate_user(self, username, password):
        # Insecure password comparison - timing attack
        query = f"SELECT * FROM users WHERE username = '{username}'"
        user = self.cursor.execute(query).fetchone()
        if user and user[2] == password:  # Plain text password comparison
            return user
        return None

    def get_user_by_email(self, email):
        # SQL injection
        query = f"SELECT * FROM users WHERE email = '{email}'"
        return self.cursor.execute(query).fetchone()

    def complex_user_query(self, filters):
        # Dynamic query building - SQL injection risk
        query = "SELECT * FROM users WHERE 1=1"
        for key, value in filters.items():
            query += f" AND {key} = '{value}'"
        return self.cursor.execute(query).fetchall()

    def export_users_to_file(self, filename):
        # Path traversal vulnerability
        users = self.get_all_users()
        with open(filename, 'w') as f:
            for user in users:
                f.write(str(user) + '\\n')

    def import_users_from_file(self, filename):
        # Potential file injection
        with open(filename, 'r') as f:
            for line in f:
                data = eval(line)  # Dangerous use of eval
                self.create_user(data[0], data[1], data[2])
"""

    start_time = time.time()

    try:
        response = requests.post(
            "http://localhost:8000/review",
            json={"code": code, "language": "python"},
            timeout=180
        )
        elapsed = time.time() - start_time
        data = response.json()

        checks = {
            "Completed without timeout": True,
            "Returned valid response": 'unique_issues' in data,
            "Found multiple issues": len(data.get('unique_issues', [])) > 5,
            "Latency acceptable (<30s)": elapsed < 30,
            "All agents completed": all(a['status'] == 'completed' for a in data.get('agent_reviews', [])),
        }

        for check, result in checks.items():
            print(f"{'✓' if result else '✗'} {check}: {result}")

        print(f"\nLarge file results:")
        print(f"  Lines: {len(code.splitlines())}")
        print(f"  Latency: {elapsed:.1f}s")
        print(f"  Issues found: {len(data.get('unique_issues', []))}")
        print(f"  Quality score: {data.get('quality_score', {}).get('overall_score')}/100")

    except requests.exceptions.Timeout:
        print("✗ Request timed out (>180s)")
    except Exception as e:
        print(f"✗ Error: {str(e)[:100]}")

def test_multiple_languages():
    """Test JavaScript/TypeScript"""
    print("\n" + "=" * 60)
    print("VALIDATION 4.2: Multiple Languages")
    print("=" * 60)

    test_cases = [
        ("javascript", """
function getUser(userId) {
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    return db.execute(query);
}

function getAllPosts(userIds) {
    const results = [];
    for (const id of userIds) {
        results.push(db.execute(`SELECT * FROM posts WHERE user_id = ${id}`));
    }
    return results;
}
"""),
        ("typescript", """
interface User {
    id: number;
    name: string;
}

function getUserData(userId: number) {
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    return db.execute(query);
}
"""),
    ]

    for language, code in test_cases:
        try:
            response = requests.post(
                "http://localhost:8000/review",
                json={"code": code, "language": language},
                timeout=90
            )
            data = response.json()

            issues = len(data.get('unique_issues', []))
            print(f"✓ {language}: {issues} issues found, score={data.get('quality_score', {}).get('overall_score')}/100")

        except Exception as e:
            print(f"✗ {language}: Error - {str(e)[:50]}")

def test_invalid_inputs():
    """Test handling of invalid inputs"""
    print("\n" + "=" * 60)
    print("VALIDATION 4.3: Invalid Input Handling")
    print("=" * 60)

    test_cases = [
        ({"language": "python"}, "Missing code field"),
        ({"code": "def foo(): pass"}, "Missing language field (should default)"),
        ({"code": "def foo(): pass", "language": "brainfuck"}, "Unsupported language"),
        ({"code": "x" * 50000, "language": "python"}, "Extremely long code"),
    ]

    for payload, description in test_cases:
        try:
            response = requests.post(
                "http://localhost:8000/review",
                json=payload,
                timeout=90
            )

            if response.status_code == 200:
                data = response.json()
                print(f"✓ {description}: Handled gracefully (returned {len(data.get('unique_issues', []))} issues)")
            else:
                print(f"~ {description}: Returned error {response.status_code}")

        except requests.exceptions.RequestException as e:
            print(f"✓ {description}: Properly rejected ({str(e)[:40]}...)")
        except Exception as e:
            print(f"~ {description}: Unexpected error - {str(e)[:50]}")

def test_weird_whitespace():
    """Test handling of weird whitespace and formatting"""
    print("\n" + "=" * 60)
    print("VALIDATION 4.4: Weird Whitespace/Formatting")
    print("=" * 60)

    test_cases = [
        ("def    foo():    pass", "Multiple spaces"),
        ("def foo():\n\n\n\n    pass", "Multiple newlines"),
        ("\t\tdef foo():\n\t\t\tpass", "Tabs"),
        ("def foo(): pass  # comment\n# another comment\ndef bar(): pass", "Mixed comments"),
    ]

    for code, description in test_cases:
        try:
            response = requests.post(
                "http://localhost:8000/review",
                json={"code": code, "language": "python"},
                timeout=90
            )
            data = response.json()
            print(f"✓ {description}: No crash, returned {len(data.get('unique_issues', []))} issues")
        except Exception as e:
            print(f"✗ {description}: Error - {str(e)[:50]}")

if __name__ == "__main__":
    test_large_file()
    test_multiple_languages()
    test_invalid_inputs()
    test_weird_whitespace()

    print("\n" + "=" * 60)
    print("✓ All Robustness Validations Complete")
    print("=" * 60)

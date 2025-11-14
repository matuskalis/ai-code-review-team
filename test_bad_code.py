"""
Test file with intentional security, performance, and style issues
"""

def get_user_data(user_id):
    # SQL Injection vulnerability - concatenating user input directly
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query).fetchone()

def get_all_user_posts(user_ids):
    # N+1 query problem - making a database call for each user
    results = []
    for user_id in user_ids:
        posts = db.execute(f"SELECT * FROM posts WHERE user_id = {user_id}").fetchall()
        results.append(posts)
    return results

def complex_validation(data):
    # Deeply nested conditionals - cyclomatic complexity issue
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

def process_payment(amount, card_number):
    # Missing error handling and input validation
    charge = stripe.charge(amount, card_number)
    return charge.id

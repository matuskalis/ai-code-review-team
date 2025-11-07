# Code Examples Guide

The system includes 4 diverse code examples to showcase different quality levels and issue types.

## 1. Vulnerable Python (Grade: D-F)

**Language:** Python
**Expected Score:** 60-65 (D)
**Issues:** 6-9 total

**What it demonstrates:**
- 🚨 **Critical Security Issue**: SQL injection vulnerability using f-strings
- ⚠️ **High Performance Issue**: N+1 query problem with sequential database calls
- 📋 **Medium Style Issue**: Poor error handling, no type hints, missing docstrings

**Key Learning:**
This is the worst-case scenario showing multiple critical flaws. All three agents should flag overlapping issues around SQL injection and poor database patterns.

---

## 2. React Component Issues (Grade: C)

**Language:** JavaScript (React)
**Expected Score:** 70-75 (C)
**Issues:** 4-6 total

**What it demonstrates:**
- 🚨 **High Security Issue**: XSS vulnerability with `dangerouslySetInnerHTML`
- ⚠️ **High Performance Issue**: Infinite loop from missing `useEffect` dependency array
- 📋 **Medium Performance**: Unnecessary re-renders, no memoization
- 💡 **Low Style**: Inconsistent error handling

**Key Learning:**
Common React anti-patterns that lead to security risks and performance problems. Shows how framework-specific issues are caught.

---

## 3. TypeScript Async Issues (Grade: B)

**Language:** TypeScript
**Expected Score:** 80-85 (B)
**Issues:** 3-4 total

**What it demonstrates:**
- ⚠️ **High Performance**: Sequential async operations that should be parallel
- 📋 **Medium**: Missing error handling for async operations
- 💡 **Low Style**: No input validation, could use Promise.all

**Key Learning:**
More subtle issues focused on async/await patterns. Shows the system catching performance optimizations and best practices.

---

## 4. Clean Python Code (Grade: A)

**Language:** Python
**Expected Score:** 90-95 (A)
**Issues:** 0-2 total (minor style suggestions only)

**What it demonstrates:**
- ✅ Proper error handling with try/except
- ✅ Type hints throughout
- ✅ Parameterized queries (prevents SQL injection)
- ✅ Batch queries (avoids N+1 problem)
- ✅ Docstrings and logging
- ✅ Clean code structure

**Key Learning:**
Shows what "good code" looks like. The system should give an A grade with minimal or no issues, demonstrating it can recognize quality code.

---

## Usage in Demos

**Shuffle Order Recommendation:**
1. Start with Example 1 (Vulnerable Python) - shows worst case, dramatic results
2. Move to Example 4 (Clean Python) - contrast to show the system recognizes good code
3. Show Example 2 (React) - demonstrates language versatility
4. Show Example 3 (TypeScript) - more subtle issues

**What to Highlight:**
- Grade progression: F → A → C → B
- How agents converge on the same critical issues
- Deduplication working across all 3 agents
- Different issue types per language
- Score calculation reflecting severity accurately

## Testing Checklist

- [ ] Example 1: Verify SQL injection flagged as Critical
- [ ] Example 1: Verify N+1 query flagged as High/Medium
- [ ] Example 2: Verify XSS flagged by Security agent
- [ ] Example 2: Verify infinite loop flagged by Performance agent
- [ ] Example 3: Verify parallel execution suggestion
- [ ] Example 4: Verify high score (90+) with minimal issues
- [ ] Shuffle button cycles through all 4 examples
- [ ] Quick-select buttons highlight current example
- [ ] Language auto-changes when loading examples

name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose
Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
[What needs to be built - be specific about the end state and desires]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]

- file: [path/to/example/file]
  why: [Pattern to follow, gotchas to avoid]

- doc: [Library documentation URL]
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]

```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase
```bash

```

### Desired Codebase tree with files to be added and responsibility of file
```bash

```

### Known Gotchas of our codebase & Library Quirks
```
# CRITICAL: [Library/Framework name] requires [specific setup]
# Example: This framework requires specific initialization order
# Example: This ORM doesn't support batch operations over N records
# Example: API rate limits to X requests per second
```

## Implementation Blueprint

### Data models and structure

Create the core data models to ensure type safety and consistency.
```
Examples (adapt to your stack):
 - Database models/entities
 - DTOs / Request-Response schemas
 - Validation schemas
 - Type definitions
```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1:
MODIFY src/existing_module:
  - FIND pattern: "class OldImplementation"
  - INJECT after line containing "constructor/init"
  - PRESERVE existing method signatures

CREATE src/new_feature:
  - MIRROR pattern from: src/similar_feature
  - MODIFY class name and core logic
  - KEEP error handling pattern identical

...(...)

Task N:
...

```


### Per task pseudocode as needed added to each task
```
# Task 1
# Pseudocode with CRITICAL details - don't write entire code

function new_feature(param):
    # PATTERN: Always validate input first (see src/validators)
    validated = validate_input(param)  # throws ValidationError

    # GOTCHA: This library requires connection pooling
    with get_connection() as conn:  # see src/db/pool
        # PATTERN: Use existing retry mechanism
        @retry(attempts=3, backoff=exponential)
        function _inner():
            # CRITICAL: API returns 429 if >10 req/sec
            rate_limiter.acquire()
            return external_api.call(validated)

        result = _inner()

    # PATTERN: Standardized response format
    return format_response(result)  # see src/utils/responses
```

### Integration Points
```yaml
DATABASE:
  - migration: "Add column 'feature_enabled' to users table"
  - index: "CREATE INDEX idx_feature_lookup ON users(feature_id)"

CONFIG:
  - add to: config/settings
  - pattern: "FEATURE_TIMEOUT = env.get('FEATURE_TIMEOUT', 30)"

ROUTES:
  - add to: src/api/routes
  - pattern: "router.register(feature_router, prefix='/feature')"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
# Adapt commands to your stack:

# Python: ruff check src/ --fix && mypy src/
# Node.js: npm run lint -- --fix && npm run type-check
# Go: go fmt ./... && go vet ./...
# Rust: cargo fmt --check && cargo clippy

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests - each new feature/file/function use existing test patterns
```
# CREATE test file with these test cases (adapt syntax to your stack):

test "happy path - basic functionality works":
    result = new_feature("valid_input")
    assert result.status == "success"

test "validation error - invalid input is rejected":
    expect_error ValidationError:
        new_feature("")

test "external api timeout - handles timeouts gracefully":
    mock external_api.call to throw TimeoutError
    result = new_feature("valid")
    assert result.status == "error"
    assert "timeout" in result.message
```

```bash
# Run and iterate until passing (adapt to your stack):
# Python: pytest tests/ -v
# Node.js: npm test
# Go: go test ./...
# Rust: cargo test

# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test
```bash
# Start the service (adapt to your stack)
# npm run dev / go run . / cargo run / python -m src.main

# Test the endpoint
curl -X POST http://localhost:8000/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Expected: {"status": "success", "data": {...}}
# If error: Check logs for stack trace
```

## Final validation Checklist
- [ ] All tests pass: `[your test command]`
- [ ] No linting errors: `[your lint command]`
- [ ] No type errors: `[your type check command]`
- [ ] Manual test successful: [specific curl/command]
- [ ] Error cases handled gracefully
- [ ] Logs are informative but not verbose
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't ignore failing tests - fix them
- ❌ Don't mix sync/async incorrectly (if applicable)
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific

# Auto-Correction Agent

> **Purpose**: Autonomous error detection, analysis, and recovery.
> **Failure Recovery Score Target**: 8/10 → 10/10

---

## Mission

Tự động phát hiện lỗi, phân tích root cause, và thực hiện recovery mà không cần human intervention (trừ critical errors).

---

## Error Classification

### Severity Levels
| Level | Code | Auto-Recover? | Human Needed? |
| :--- | :---: | :---: | :---: |
| **Critical** | E1xx | ❌ | ✅ Always |
| **High** | E2xx | ⚠️ 1 attempt | ✅ If fails |
| **Medium** | E3xx | ✅ 3 attempts | ❌ |
| **Low** | E4xx | ✅ Auto-fix | ❌ |

### Error Catalog
```yaml
errors:
  # Critical (E1xx) - Never auto-recover
  E100:
    name: DATA_CORRUPTION
    description: Database integrity compromised
    action: HALT_AND_NOTIFY
    
  E101:
    name: SECURITY_BREACH
    description: RLS bypass detected
    action: HALT_AND_NOTIFY
    
  E102:
    name: PRODUCTION_IMPACT
    description: Live system affected
    action: HALT_AND_NOTIFY

  # High (E2xx) - Try once
  E200:
    name: MIGRATION_FAILED
    description: SQL migration error
    action: ROLLBACK_AND_RETRY
    recovery_steps:
      - run: "psql -f {migration}.down.sql"
      - analyze: syntax_error | constraint_violation
      - fix: auto_correct_sql
      - retry: once
      
  E201:
    name: API_ENDPOINT_CRASH
    description: Go handler panic
    action: ANALYZE_AND_FIX
    recovery_steps:
      - capture: stack_trace
      - analyze: nil_pointer | type_assertion | logic_error
      - fix: add_nil_check | fix_type | refactor_logic
      - retry: once

  # Medium (E3xx) - Try 3 times
  E300:
    name: TEST_FAILURE
    description: Unit/Integration test failed
    action: AUTO_FIX
    recovery_steps:
      - analyze: assertion_failed | setup_error | timeout
      - fix: correct_assertion | fix_setup | increase_timeout
      - retry: 3
      
  E301:
    name: BUILD_ERROR
    description: TypeScript/Go compilation error
    action: AUTO_FIX
    recovery_steps:
      - parse: error_message
      - identify: missing_import | type_mismatch | syntax
      - fix: add_import | cast_type | fix_syntax
      - retry: 3

  # Low (E4xx) - Auto-fix immediately
  E400:
    name: LINT_WARNING
    description: Code style violation
    action: AUTO_FIX
    recovery_steps:
      - run: "npm run lint --fix" | "golangci-lint run --fix"
      
  E401:
    name: MISSING_TRANSLATION
    description: i18n key not found
    action: AUTO_FIX
    recovery_steps:
      - identify: missing_key
      - add: translation_to_both_locales
      
  E402:
    name: MISSING_INDEX
    description: Slow query detected
    action: AUTO_FIX
    recovery_steps:
      - analyze: query_plan
      - generate: CREATE INDEX statement
      - apply: if_dev_mode
```

---

## Recovery Strategies

### Strategy 1: Rollback & Retry
```yaml
strategy: rollback_retry
applies_to: [E200, E201]
steps:
  1. Save current state snapshot
  2. Rollback to last successful checkpoint
  3. Analyze error cause
  4. Apply fix
  5. Retry from checkpoint
  6. If fail again → escalate to human
```

### Strategy 2: Patch & Continue
```yaml
strategy: patch_continue
applies_to: [E300, E301, E400, E401]
steps:
  1. Identify specific error location
  2. Generate minimal fix
  3. Apply fix inline
  4. Re-run failed check only
  5. Continue workflow if pass
```

### Strategy 3: Alternative Path
```yaml
strategy: alternative_path
applies_to: [timeout, resource_unavailable]
steps:
  1. Detect blocked path
  2. Find alternative approach
  3. Switch to alternative
  4. Continue from current state
examples:
  - blocked: "npm install hangs"
    alternative: "use yarn install"
  - blocked: "API timeout"
    alternative: "retry with exponential backoff"
```

---

## Learning from Errors

### Error Memory
```yaml
error_memory:
  storage: ".agent/error_log.json"
  retention: 30_days
  structure:
    - error_code: E301
      pattern: "Cannot find module 'X'"
      fix_applied: "npm install X"
      success: true
      timestamp: "2026-01-12T20:00:00Z"
      
  # Learning: If same pattern seen before, apply known fix immediately
  auto_apply_threshold: 2  # If fix worked 2+ times, auto-apply
```

### Pattern Recognition
```yaml
patterns:
  - name: missing_dependency
    regex: "Cannot find module '(.+)'"
    fix_template: "npm install $1"
    
  - name: undefined_variable
    regex: "'(.+)' is not defined"
    fix_template: "import { $1 } from './types'"
    
  - name: nil_pointer_go
    regex: "panic: runtime error: invalid memory address"
    fix_template: "Add nil check before access"
    
  - name: rls_context_missing
    regex: "current_setting.*returns null"
    fix_template: "Add SetTenantContext call before query"
```

---

## Circuit Breaker Pattern

### V2 Configuration (Red Team Corrected)
```yaml
# CRITICAL: Stricter limits to prevent token waste
recovery_limits:
  max_retries_per_state: 2      # V1 was 3
  max_total_retries: 5          # V1 was 10
  same_error_threshold: 2       # Same error 2x → escalate immediately
  
  backoff:
    type: exponential
    initial: 1s
    multiplier: 2
    max: 60s
    sequence: [1s, 2s, 4s, 8s, 16s, 32s, 60s]
```

### Configuration
```yaml
circuit_breaker:
  # Per-step limits
  max_retries_per_step: 3
  max_total_retries: 10
  
  # Timeouts
  step_timeout: 600s
  total_workflow_timeout: 3600s
  
  # Thresholds
  error_rate_threshold: 0.5  # 50% failure rate
  consecutive_failures: 5
  
  # States
  states:
    CLOSED: "Normal operation, errors tracked"
    OPEN: "Too many failures, block new attempts"
    HALF_OPEN: "Allow one test attempt"
    
  # Recovery
  open_duration: 60s  # Wait before trying again
  success_threshold: 2  # Successes to close circuit
```

### Implementation
```yaml
on_error:
  1. Increment failure counter
  2. Check if circuit should OPEN:
     - consecutive_failures >= 5
     - error_rate > 50%
  3. If OPEN:
     - Wait open_duration
     - Transition to HALF_OPEN
     - Allow single retry
  4. If retry succeeds:
     - Transition to CLOSED
     - Reset counters
  5. If retry fails:
     - Return to OPEN
     - Escalate to human
```

---

## Integration Points

### With State Machine
```yaml
state_machine_hooks:
  on_enter_FAILED:
    - call: auto_correction_agent.analyze
  on_enter_RECOVERY:
    - call: auto_correction_agent.execute_strategy
  on_exit_RECOVERY:
    - call: auto_correction_agent.log_result
```

### With Checkpoints
```yaml
checkpoint_integration:
  before_retry:
    - load: last_successful_checkpoint
  after_success:
    - save: new_checkpoint
  on_unrecoverable:
    - rollback: to_checkpoint
    - notify: human
```

---

## Escalation Protocol

### Escalation Triggers
| Trigger | Action |
| :--- | :--- |
| E1xx (Critical) | Immediate notify |
| 3 failed retries | Notify with analysis |
| Circuit OPEN | Notify with recommendation |
| Timeout exceeded | Notify with status |

### Notification Format
```markdown
## ⚠️ AUTO-CORRECTION ESCALATION

**Error**: {error_code} - {error_name}
**State**: {current_state}
**Retry Count**: {retries}/{max_retries}

### Error Details
{error_message}

### Recovery Attempts
1. {strategy_1} → {result}
2. {strategy_2} → {result}
3. {strategy_3} → {result}

### Recommended Action
{recommended_fix}

### Quick Commands
- `/retry` - Retry with same strategy
- `/rollback {checkpoint}` - Go back to checkpoint
- `/abort` - Cancel workflow
```

---

## Metrics

### Success Rate Tracking
```yaml
metrics:
  auto_recovery_success_rate:
    formula: successful_recoveries / total_errors
    target: "> 80%"
    
  mean_time_to_recovery:
    formula: avg(recovery_end - error_detected)
    target: "< 60s for E3xx/E4xx"
    
  human_escalation_rate:
    formula: escalations / total_errors
    target: "< 20%"
```

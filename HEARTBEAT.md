# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.
# Add tasks below when you want the agent to check something periodically.

---

# System Event Triggers

When the system receives these events, automatically respond:

## morning-brief
When "morning-brief" system event is received:
1. Run the morning-brief skill script directly: `/Users/spiritmade/clawd/skills/morning-brief/scripts/send-brief.js`
2. Return the script output as the response

## security-audit
When "security-audit" system event is received:
1. Run the security-audit skill: `clawdbot system event --text "security-audit" --mode now --expect-final`
2. Return the full output as the response
3. Alert if critical issues are found

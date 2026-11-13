import { readFileSync } from 'node:fs';
import { activateSession, checkFileOperation, sessionIsActive, statusContext } from './policy.mjs';

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  if (input.hook_event_name === 'UserPromptSubmit') {
    console.log(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit', additionalContext: statusContext(root, 'claude', sessionIsActive(root, 'claude', input.session_id)),
    } }));
  } else if (input.hook_event_name === 'PreToolUse') {
    if (input.tool_name === 'Skill' && input.tool_input?.skill === 'mapurito-claude') {
      activateSession(root, 'claude', input.session_id);
    }
    const result = checkFileOperation(root, 'claude', input.tool_name, input.tool_input,
      sessionIsActive(root, 'claude', input.session_id));
    console.log(JSON.stringify(result.decision === 'deny' ? { hookSpecificOutput: {
      hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: result.reason,
    } } : {}));
  } else if (input.hook_event_name === 'UserPromptExpansion' && input.command_name === 'mapurito-claude') {
    activateSession(root, 'claude', input.session_id);
    console.log('{}');
  } else {
    throw new Error('Unsupported hook event');
  }
} catch (error) {
  console.error(`Mapurito hook failed closed: ${error.message}`);
  process.exitCode = 2;
}

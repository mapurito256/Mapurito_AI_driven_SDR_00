import { activateSession, checkFileOperation, sessionIsActive, statusContext } from '../../.agents/mapurito/runtime/policy.mjs';

export const Mapurito = async ({ directory }) => ({
  'tool.execute.before': async (input, output) => {
    if (input.tool === 'skill' && output.args.name === 'mapurito') {
      activateSession(directory, 'opencode', input.sessionID);
    }
    const result = checkFileOperation(directory, 'opencode', input.tool, output.args,
      sessionIsActive(directory, 'opencode', input.sessionID));
    if (result.decision === 'deny') throw new Error(result.reason);
  },
  'experimental.chat.system.transform': async (input, output) => {
    output.system.push(statusContext(directory, 'opencode', sessionIsActive(directory, 'opencode', input.sessionID)));
  },
});

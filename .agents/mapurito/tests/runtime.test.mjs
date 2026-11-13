import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { activateSession, checkFileOperation as checkOperation, detectStage, discoverInputs, sessionIsActive, statusContext } from '../runtime/policy.mjs';
import { Mapurito } from '../../../.opencode/plugins/mapurito.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const temporary = [];
// Policy cases explicitly exercise an activated executor unless overridden.
const checkFileOperation = (root, platform, tool, args, active = true) => checkOperation(root, platform, tool, args, active);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const put = (root, name, content) => {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content));
};

function setup() {
  const root = mkdtempSync('/tmp/opencode/mapurito test-');
  temporary.push(root);
  const files = [
    '.agents/mapurito/layout.json', '.opencode/opencode.json', '.claude/settings.json',
    ...['ctx00', 'ctx01', 'ctx02', 'ctx03'].map((s) => `.agents/mapurito/adapters/claude-code/${s}.json`),
  ];
  for (const file of files) put(root, file, readFileSync(path.join(repo, file), 'utf8'));
  return root;
}

// Synthetic closure evidence is test data only, never a real human approval.
function closeStage(root, index) {
  const stage = `ctx0${index}`;
  const prefix = `results/${stage}`;
  const name = ['problem', 'requirements', 'architecture', 'build-package'][index];
  const state = { stage: `Ctx0${index}`, status: 'approved', decision: 'APROBAR',
    V1: { decision: 'APROBAR' }, V2: { decision: 'APROBAR', presentation: 1 } };
  if (index === 1) delete state.status;
  const baseline = { stage: `Ctx0${index}`, status: index < 2 ? 'frozen' : 'approved', decision: 'APROBAR', signer: 'Synthetic test signer' };
  if (index > 0) baseline.items = [];
  const events = [{ event: index === 1 ? 'feedback_received' : 'HUMAN_FEEDBACK', decision: 'APROBAR' }];
  if (index === 0) {
    state.current_step = null;
    baseline.approved = { by: 'Synthetic test signer', decision: 'APROBAR' };
    baseline.open_questions = [];
    for (const [key, file] of [['document', 'problem-definition.md'], ['intake', 'intake.md']]) {
      put(root, `${prefix}/${file}`, 'Test material\n');
      baseline[key] = { path: `${prefix}/${file}`, sha256: hash('Test material\n') };
    }
  }
  if (index > 1) {
    events.push(...['V1', 'V2'].map((validation) => ({ event: 'VALIDATION_APPROVED', validation })));
    put(root, `${prefix}/questions.json`, { questions: [] });
  }
  if (index === 3) {
    put(root, `${prefix}/final-spec.md`, 'Reviewed bytes\n');
    put(root, `${prefix}/validations/V2/R1/final-spec.md`, 'Reviewed bytes\n');
    baseline.manifest = [{ path: `${prefix}/final-spec.md`, sha256: hash('Reviewed bytes\n') }];
  }
  events.push({ event: index === 1 ? 'baseline_frozen' : 'STAGE_APPROVED' });
  if (index === 0) events.push({ event: 'SUBSTAGE_END', step: 7 });
  const content = JSON.stringify(baseline);
  put(root, `${prefix}/state.json`, state);
  put(root, `${prefix}/events.jsonl`, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  put(root, `${prefix}/${name}-baseline.json`, content);
  put(root, `${prefix}/${name}-baseline.sha256`, `${hash(content)}  ${prefix}/${name}-baseline.json\n`);
  put(root, `${prefix}/CONTEXT-${stage}.md`, `Status: ${index < 2 ? 'frozen' : 'approved'}\n${hash(content)}\n`);
}

afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });

test('new run chooses ctx00 scope but creates no execution or input files', () => {
  const root = setup();
  assert.equal(detectStage(root).stage, 'ctx00');
  assert.equal(existsSync(path.join(root, 'results')), false);
  assert.deepEqual(discoverInputs(root), { action: 'request-upload', files: [] });
});

test('input discovery implements zero / one / several without reading or converting material', () => {
  const root = setup();
  put(root, 'inputs/.gitkeep', '');
  mkdirSync(path.join(root, 'inputs/nested'));
  assert.equal(discoverInputs(root).action, 'request-upload');
  put(root, 'inputs/one.md', 'Literal input');
  assert.deepEqual(discoverInputs(root), { action: 'select-single', files: ['inputs/one.md'] });
  put(root, 'inputs/two.pdf', 'Not parsed by the router');
  assert.equal(discoverInputs(root).action, 'ask-selection');
  assert.equal(discoverInputs(root).files.length, 2);
});

for (const platform of ['claude', 'opencode']) {
  test(`${platform}: automatic profile advances only after verified closure`, () => {
    const root = setup();
    for (let index = 0; index < 4; index++) {
      const stage = `ctx0${index}`;
      assert.equal(detectStage(root).stage, stage);
      const accepted = checkFileOperation(root, platform, 'Write', { file_path: `results/${stage}/state.json` });
      assert.equal(accepted.decision, 'normal');
      assert.equal(accepted.stage, stage);
      assert.match(accepted.profile, new RegExp(stage));
      assert.equal(checkFileOperation(root, platform, 'Edit', { file_path: 'AGENTS.md' }).decision, 'deny');
      assert.equal(checkFileOperation(root, platform, 'Edit', { file_path: 'results/ctx99/state.json' }).decision, 'deny');
      closeStage(root, index);
    }
    assert.equal(detectStage(root).status, 'complete');
    assert.equal(checkFileOperation(root, platform, 'Write', { file_path: 'results/ctx03/new.md' }).decision, 'deny');
  });
}

test('partial freeze remains in its stage; conflicting records never grant next-stage writes', () => {
  const root = setup();
  put(root, 'results/ctx00/problem-baseline.json', { status: 'frozen' });
  assert.equal(detectStage(root).stage, 'ctx00');
  assert.equal(checkFileOperation(root, 'opencode', 'write', { filePath: 'results/ctx01/new.md' }).decision, 'deny');
  put(root, 'results/ctx01/state.json', { stage: 'Ctx01' });
  assert.match(checkFileOperation(root, 'opencode', 'write', { filePath: 'results/ctx00/new.md' }).reason, /unfinished stage/);
});

test('closure event before final state does not deadlock the owning freeze step', () => {
  const root = setup();
  closeStage(root, 0);
  put(root, 'results/ctx00/state.json', { stage: 'Ctx00', status: 'running', current_step: 7, decision: 'APROBAR' });
  assert.equal(detectStage(root).status, 'closing');
  assert.equal(checkFileOperation(root, 'claude', 'Edit', { file_path: 'results/ctx00/state.json' }).decision, 'normal');
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'results/ctx01/new.md' }).decision, 'deny');
  put(root, 'results/ctx00/state.json', { stage: 'Ctx00', status: 'approved', current_step: null, decision: 'APROBAR' });
  assert.equal(detectStage(root).stage, 'ctx01');
});

test('blocked current stage allows correction, stopped or returned stages require human reopening', () => {
  const root = setup();
  for (const status of ['blocked', 'stopped', 'returned_upstream', 'not_approved']) {
    put(root, 'results/ctx00/state.json', { stage: 'Ctx00', status });
    assert.equal(checkFileOperation(root, 'claude', 'Edit', { file_path: 'results/ctx00/state.json' }).decision,
      status === 'blocked' ? 'normal' : 'deny');
  }
});

test('checksum corruption, open questions and missing approval fail closed', () => {
  const root = setup();
  closeStage(root, 0);
  put(root, 'results/ctx00/problem-baseline.json', '{}');
  assert.throws(() => detectStage(root), /stage mismatch|checksum/);
  closeStage(root, 0);
  const state = { stage: 'Ctx00', status: 'approved', decision: 'pending' };
  put(root, 'results/ctx00/state.json', state);
  assert.throws(() => detectStage(root), /state decision/);
  closeStage(root, 0);
  const basePath = 'results/ctx00/problem-baseline.json';
  const base = JSON.parse(readFileSync(path.join(root, basePath), 'utf8'));
  base.open_questions.push({ state: 'open' });
  const content = JSON.stringify(base);
  put(root, basePath, content);
  put(root, basePath.replace('.json', '.sha256'), `${hash(content)}  ${basePath}\n`);
  put(root, 'results/ctx00/CONTEXT-ctx00.md', `Status: frozen\n${hash(content)}`);
  assert.throws(() => detectStage(root), /closed questions/);
});

test('patch rename/delete, traversal, symlinks and immutable intake cannot bypass write scope', () => {
  const root = setup();
  assert.equal(checkFileOperation(root, 'opencode', 'apply_patch', {
    patchText: '*** Begin Patch\n*** Add File: results/ctx00/x.md\n+x\n*** End Patch',
  }).decision, 'normal');
  for (const patchText of ['*** Update File: results/ctx00/x.md\n*** Move to: .agents/x', '*** Delete File: AGENTS.md']) {
    assert.equal(checkFileOperation(root, 'opencode', 'apply_patch', { patchText }).decision, 'deny');
  }
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: '../outside.md' }).decision, 'deny');
  mkdirSync(path.join(root, 'results/ctx00'), { recursive: true });
  symlinkSync(path.join(root, '.agents'), path.join(root, 'results/ctx00/link'));
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'results/ctx00/link/file' }).decision, 'deny');
  put(root, 'results/ctx00/intake.md', 'Immutable');
  put(root, 'results/ctx00/events.jsonl', '{"event":"SUBSTAGE_END","step":1}\n');
  assert.match(checkFileOperation(root, 'claude', 'Edit', { file_path: 'results/ctx00/intake.md' }).reason, /immutable/);
});

test('ctx03 cannot report completion when final bytes differ from the reviewed candidate', () => {
  const root = setup();
  for (let index = 0; index < 4; index++) closeStage(root, index);
  put(root, 'results/ctx03/validations/V2/R1/final-spec.md', 'Different candidate');
  assert.throws(() => detectStage(root), /candidate differs/);
});

test('missing stage policy fails closed; reads remain available for recovery', () => {
  const root = setup();
  rmSync(path.join(root, '.agents/mapurito/adapters/claude-code/ctx00.json'));
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'results/ctx00/x' }).decision, 'deny');
  assert.equal(checkFileOperation(root, 'claude', 'Read', { file_path: '.agents/mapurito/layout.json' }).decision, 'normal');
  assert.match(statusContext(root, 'claude'), /execution blocked/);
});

test('selected profile denies are applied, not merely read as descriptive context', () => {
  const root = setup();
  const claudePath = '.agents/mapurito/adapters/claude-code/ctx00.json';
  const claude = JSON.parse(readFileSync(path.join(root, claudePath), 'utf8'));
  claude.permissions.deny.push('Edit(./results/ctx00/locked.md)');
  put(root, claudePath, claude);
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'results/ctx00/locked.md' }).decision, 'deny');
  const config = JSON.parse(readFileSync(path.join(root, '.opencode/opencode.json'), 'utf8'));
  config.agent['mapurito-ctx00'].permission.edit['results/ctx00/locked.md'] = 'deny';
  config.agent['mapurito-ctx00'].permission.edit['*/results/ctx00/locked.md'] = 'deny';
  put(root, '.opencode/opencode.json', config);
  assert.equal(checkFileOperation(root, 'opencode', 'write', { filePath: 'results/ctx00/locked.md' }).decision, 'deny');
});

test('fully recorded historical deferral approval preserves bytes and obligations', () => {
  const root = setup();
  closeStage(root, 0);
  closeStage(root, 1);
  const prefix = 'results/ctx01';
  const state = JSON.parse(readFileSync(path.join(root, prefix, 'state.json'), 'utf8'));
  state.decision = 'APROBAR_CON_APLAZAMIENTO';
  put(root, `${prefix}/state.json`, state);
  const baseline = JSON.parse(readFileSync(path.join(root, prefix, 'requirements-baseline.json'), 'utf8'));
  baseline.decision = state.decision;
  baseline.items.push({ type: 'DFR', estado: 'abierto', etapa_responsable: 'Ctx02' });
  const content = JSON.stringify(baseline);
  put(root, `${prefix}/requirements-baseline.json`, content);
  put(root, `${prefix}/requirements-baseline.sha256`, `${hash(content)}  ${prefix}/requirements-baseline.json\n`);
  put(root, `${prefix}/CONTEXT-ctx01.md`, `Status: frozen\n${hash(content)}`);
  put(root, `${prefix}/events.jsonl`, JSON.stringify({ event: 'feedback_received', decision: state.decision })
    + '\n' + JSON.stringify({ event: 'baseline_frozen' }) + '\n');
  assert.equal(detectStage(root).stage, 'ctx02');
  assert.equal(readFileSync(path.join(root, prefix, 'requirements-baseline.json'), 'utf8'), content);
});

test('OpenCode adapter actually rejects before execution and injects current-stage context', async () => {
  const root = setup();
  const hooks = await Mapurito({ directory: root });
  const sessionID = 'opencode-test-session';
  await assert.rejects(hooks['tool.execute.before']({ tool: 'write', sessionID }, { args: { filePath: 'AGENTS.md' } }), /Protected/);
  await assert.rejects(hooks['tool.execute.before']({ tool: 'write', sessionID }, { args: { filePath: 'results/ctx00/x' } }), /entry skill/);
  await hooks['tool.execute.before']({ tool: 'skill', sessionID }, { args: { name: 'mapurito' } });
  await hooks['tool.execute.before']({ tool: 'write', sessionID }, { args: { filePath: 'results/ctx00/x' } });
  const output = { system: [] };
  await hooks['experimental.chat.system.transform']({ sessionID }, output);
  assert.match(output.system[0], /scope: ctx00/);
  assert.match(output.system[0], /execution active in this session: true/);
});

test('Claude adapter emits native deny JSON and fails closed on malformed hook input', () => {
  const root = setup();
  const hook = path.join(repo, '.agents/mapurito/runtime/claude-hook.mjs');
  const invoke = (input) => spawnSync(process.execPath, [hook], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: root }, input: typeof input === 'string' ? input : JSON.stringify({ session_id: 'claude-test-session', ...input }), encoding: 'utf8',
  });
  const denied = invoke({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'AGENTS.md' } });
  assert.equal(denied.status, 0);
  assert.equal(JSON.parse(denied.stdout).hookSpecificOutput.permissionDecision, 'deny');
  const activation = invoke({ hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill: 'mapurito-claude' } });
  assert.equal(activation.status, 0);
  const allowed = invoke({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'results/ctx00/x' } });
  assert.deepEqual(JSON.parse(allowed.stdout), {});
  const context = invoke({ hook_event_name: 'UserPromptSubmit', prompt: 'Continue' });
  assert.match(JSON.parse(context.stdout).hookSpecificOutput.additionalContext, /scope: ctx00/);
  assert.equal(invoke('{invalid').status, 2);
  const expansion = invoke({ hook_event_name: 'UserPromptExpansion', command_name: 'mapurito-claude', session_id: 'slash-session' });
  assert.equal(expansion.status, 0);
  assert.equal(sessionIsActive(root, 'claude', 'slash-session'), true);
});

test('activation is session-bound and does not restrict unrelated code before entry', () => {
  const root = setup();
  assert.equal(sessionIsActive(root, 'claude', 'one'), false);
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'src/app.js' }, false).decision, 'normal');
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'results/ctx00/x' }, false).decision, 'deny');
  activateSession(root, 'claude', 'one');
  assert.equal(sessionIsActive(root, 'claude', 'one'), true);
  assert.equal(sessionIsActive(root, 'claude', 'two'), false);
  assert.equal(sessionIsActive(root, 'opencode', 'one'), false);
  assert.equal(checkFileOperation(root, 'claude', 'Write', { file_path: 'src/app.js' }, true).decision, 'deny');
  assert.equal(existsSync(path.join(root, 'results')), false);
});

test('configured Claude shell command handles project paths with spaces and missing Node', () => {
  const root = setup();
  for (const file of ['policy.mjs', 'claude-hook.mjs']) {
    const relative = `.agents/mapurito/runtime/${file}`;
    put(root, relative, readFileSync(path.join(repo, relative), 'utf8'));
  }
  const settings = JSON.parse(readFileSync(path.join(repo, '.claude/settings.json'), 'utf8'));
  const command = settings.hooks.PreToolUse[0].hooks[0].command;
  const input = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'AGENTS.md' } });
  const invoke = (env) => spawnSync('/bin/sh', ['-c', command], { env, input, encoding: 'utf8' });
  const result = invoke({ ...process.env, CLAUDE_PROJECT_DIR: root });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(invoke({ CLAUDE_PROJECT_DIR: root, PATH: '/missing-node' }).status, 2);
});

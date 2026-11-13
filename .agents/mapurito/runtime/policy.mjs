import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const stages = ['ctx00', 'ctx01', 'ctx02', 'ctx03'];
const baselines = ['problem', 'requirements', 'architecture', 'build-package'];
const protectedRoots = [
  '.agents', '.claude', '.opencode', '.mapurito', '.git', 'inputs',
  'pipeline-layout', 'define-problem', 'specify-requirements',
  'resolve-architecture-v2', 'compile-build-package-v2',
];
const writes = new Set(['write', 'edit', 'multiedit', 'notebookedit', 'apply_patch']);
const reads = new Set(['read']);
const canonicalFile = (file) => {
  if (realpathSync(file) !== path.resolve(file)) throw new Error(`Symlinked runtime resource: ${path.basename(file)}`);
  return file;
};
const json = (file) => {
  canonicalFile(file);
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch { throw new Error(`Cannot parse JSON: ${path.basename(file)}`); }
};
const digest = (file) => createHash('sha256').update(readFileSync(canonicalFile(file))).digest('hex');
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const within = (parent, child) => child === parent || child.startsWith(`${parent}${path.sep}`);

function eventsAt(directory) {
  const file = path.join(directory, 'events.jsonl');
  if (!existsSync(file)) return [];
  canonicalFile(file);
  try { return readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim()).map(JSON.parse); }
  catch { throw new Error('Malformed event log; reconcile existing records'); }
}

function verifiedBaseline(root, stage, index, events, state) {
  const directory = path.join(root, 'results', stage);
  const file = path.join(directory, `${baselines[index]}-baseline.json`);
  const baseline = json(file);
  if (baseline.stage !== `Ctx${String(index).padStart(2, '0')}`) throw new Error(`${stage}: baseline stage mismatch`);
  const checksum = readFileSync(canonicalFile(file.replace(/\.json$/, '.sha256')), 'utf8').trim();
  const match = /^([a-f0-9]{64}) [ *](.+)$/i.exec(checksum);
  if (!match || path.resolve(root, match[2]) !== file || digest(file) !== match[1].toLowerCase()) {
    throw new Error(`${stage}: invalid baseline checksum; do not rehash altered content`);
  }
  const context = readFileSync(canonicalFile(path.join(directory, `CONTEXT-${stage}.md`)), 'utf8');
  if (!context.includes(match[1].toLowerCase())) throw new Error(`${stage}: handoff baseline hash mismatch`);
  const closed = index === 1 ? 'baseline_frozen' : 'STAGE_APPROVED';
  if (!events.some((event) => event.event === closed)) throw new Error(`${stage}: missing closure event`);
  const lastFeedback = events.filter((event) => ['HUMAN_FEEDBACK', 'feedback_received'].includes(event.event)).at(-1);
  const approvalCodes = index === 1 ? ['APROBAR', 'APROBAR_CON_APLAZAMIENTO'] : ['APROBAR'];
  if (!approvalCodes.includes(lastFeedback?.decision)) throw new Error(`${stage}: latest human feedback is not approval`);
  if (/not_approved|returned_upstream|\bStatus:\s*stopped/i.test(context)) {
    throw new Error(`${stage}: handoff contradicts closure`);
  }
  if (index === 0) {
    if (baseline.status !== 'frozen' || baseline.approved?.decision !== 'APROBAR'
      || !nonempty(baseline.approved?.by) || !/Status:\s*frozen/i.test(context)
      || !Array.isArray(baseline.open_questions)
      || !baseline.open_questions.every((q) => ['closed (answered)', 'closed (forced)'].includes(q.state))) {
      throw new Error(`${stage}: approval, closed questions or frozen handoff missing`);
    }
    for (const item of [baseline.document, baseline.intake]) {
      if (!item || !nonempty(item.path) || !within(directory, path.resolve(root, item.path))
        || digest(path.resolve(root, item.path)) !== item.sha256) throw new Error(`${stage}: document/intake hash mismatch`);
    }
  } else {
    if (baseline.status !== (index === 1 ? 'frozen' : 'approved')
      || !approvalCodes.includes(baseline.decision) || !nonempty(baseline.signer)) {
      throw new Error(`${stage}: missing signed approval; historical records require compatibility review`);
    }
    if (index === 1 && (!Array.isArray(baseline.items)
      || baseline.items.some((item) => item.type === 'OQ' && item.estado !== 'cerrada'))) {
      throw new Error(`${stage}: unresolved questions in frozen requirements`);
    }
    if (index > 1) {
      const questions = json(path.join(directory, 'questions.json')).questions;
      if (!Array.isArray(questions) || questions.some((question) => !['answered', 'closed-forced'].includes(question.state))) {
        throw new Error(`${stage}: unresolved blocking questions at closure`);
      }
      for (const validation of ['V1', 'V2']) {
        if (!events.some((event) => event.event === 'VALIDATION_APPROVED' && event.validation === validation)) {
          throw new Error(`${stage}: missing ${validation} approval`);
        }
      }
    }
  }
  if (index === 3) {
    const finalPath = 'results/ctx03/final-spec.md';
    if (!Array.isArray(baseline.manifest) || !baseline.manifest.some((item) => item.path === finalPath)) {
      throw new Error(`${stage}: final document missing from manifest`);
    }
    for (const item of baseline.manifest) {
      if (!nonempty(item.path) || !within(directory, path.resolve(root, item.path))
        || digest(path.resolve(root, item.path)) !== item.sha256) throw new Error(`${stage}: manifest hash mismatch`);
    }
    const presentation = state.V2?.presentation;
    if (!Number.isInteger(presentation) || presentation < 1 || presentation > 4) throw new Error(`${stage}: invalid reviewed presentation`);
    const candidate = path.join(directory, `validations/V2/R${presentation}/final-spec.md`);
    if (digest(path.join(root, finalPath)) !== digest(candidate)) throw new Error(`${stage}: final candidate differs`);
  }
  // These checks select a write scope, not a substitute for the stage's admission/gates.
  return baseline;
}

export function detectStage(projectRoot) {
  const root = realpathSync(projectRoot);
  const layout = json(path.join(root, '.agents/mapurito/layout.json'));
  if (layout.format_version !== 1 || layout.mode !== 'development' || layout.project_root !== '.'
    || layout.method_root !== '.' || layout.input_root !== 'inputs' || layout.result_root !== 'results'
    || layout.methodology_version !== null) {
    throw new Error('Unsupported Mapurito layout; versioned relocation is not active');
  }
  for (const [index, stage] of stages.entries()) {
    const directory = path.join(root, 'results', stage);
    if (existsSync(directory) && realpathSync(directory) !== directory) throw new Error(`${stage}: symlinked results directory`);
    const stateFile = path.join(directory, 'state.json');
    const state = existsSync(stateFile) ? json(stateFile) : null;
    const events = eventsAt(directory);
    if (state && state.stage !== `Ctx${String(index).padStart(2, '0')}`) throw new Error(`${stage}: state stage mismatch`);
    if (['not_approved', 'stopped', 'returned_upstream'].includes(state?.status) || state?.decision === 'DETENER') {
      throw new Error(`${stage}: execution stopped or returned; human-controlled reopening required`);
    }
    if (index === 0 && state?.status === 'approved' && state.decision !== 'APROBAR') {
      throw new Error(`${stage}: state decision contradicts approval`);
    }
    const closingEvent = events.some((event) => event.event === (index === 1 ? 'baseline_frozen' : 'STAGE_APPROVED'));
    const closureFiles = [`${baselines[index]}-baseline.json`, `${baselines[index]}-baseline.sha256`, `CONTEXT-${stage}.md`];
    const stateClosed = index === 1 ? ['APROBAR', 'APROBAR_CON_APLAZAMIENTO'].includes(state?.decision) : state?.status === 'approved';
    const stepClosed = index !== 0 || (state?.current_step === null
      && events.some((event) => event.event === 'SUBSTAGE_END' && event.step === 7));
    const completeEvidence = closingEvent && stateClosed && stepClosed
      && closureFiles.every((file) => existsSync(path.join(directory, file)));
    if (completeEvidence) {
      if (index === 0 && state.decision !== 'APROBAR') throw new Error(`${stage}: state decision is not approval`);
      if (index > 1 && ['V1', 'V2'].some((v) => state[v]?.decision !== 'APROBAR')) {
        throw new Error(`${stage}: state validation decisions contradict closure`);
      }
      verifiedBaseline(root, stage, index, events, state);
      continue;
    }
    for (const later of stages.slice(index + 1)) {
      if (['state.json', 'events.jsonl', `CONTEXT-${later}.md`, `${baselines[stages.indexOf(later)]}-baseline.json`]
        .some((file) => existsSync(path.join(root, 'results', later, file)))) {
        throw new Error(`${stage}: unfinished stage with later execution state`);
      }
    }
    const closing = closingEvent || (index !== 1 && state?.status === 'approved');
    return { stage, status: closing ? 'closing' : state?.status ?? (state ? 'in_progress' : 'not_started'), root };
  }
  return { stage: null, status: 'complete', root };
}

function safeRelative(root, supplied) {
  if (!nonempty(supplied)) throw new Error('Missing file path');
  const absolute = path.resolve(root, supplied);
  if (!within(root, absolute)) throw new Error('File is outside the project');
  let ancestor = absolute;
  while (!existsSync(ancestor)) {
    // A dangling symlink must not be mistaken for a new directory.
    try { if (lstatSync(ancestor).isSymbolicLink()) throw new Error('Dangling symlink'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    ancestor = path.dirname(ancestor);
  }
  if (realpathSync(ancestor) !== ancestor) throw new Error('Symlink paths are not supported for execution');
  return path.relative(root, absolute).split(path.sep).join('/');
}

function targetPaths(tool, args) {
  if (tool !== 'apply_patch') return [args.filePath ?? args.file_path ?? args.notebook_path];
  if (!nonempty(args.patchText)) throw new Error('Missing patchText');
  const paths = [...args.patchText.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map((m) => m[1].trim());
  if (!paths.length) throw new Error('Patch contains no recognized file operations');
  return paths;
}

function loadProfile(root, stage, platform) {
  if (platform === 'opencode') {
    const config = json(path.join(root, '.opencode/opencode.json'));
    const profile = config.agent?.[`mapurito-${stage}`];
    if (profile?.permission?.edit?.['*'] !== 'deny'
      || profile.permission.edit[`results/${stage}/*`] !== 'ask') throw new Error(`Invalid ${stage} OpenCode profile`);
    for (const [permission, rule] of Object.entries(profile.permission)) {
      if (permission !== 'edit' && JSON.stringify(rule) !== JSON.stringify(config.permission?.[permission])) {
        throw new Error(`${stage}: non-file permissions must match the startup policy`);
      }
    }
    return { id: `.opencode/opencode.json#agent.mapurito-${stage}`, edit: profile.permission.edit };
  }
  const relative = `.agents/mapurito/adapters/claude-code/${stage}.json`;
  const profile = json(path.join(root, relative));
  if (!Array.isArray(profile.permissions?.deny)
    || !stages.filter((s) => s !== stage).every((s) => profile.permissions.deny.includes(`Edit(./results/${s}/**)`))) {
    throw new Error(`Invalid ${stage} Claude profile`);
  }
  const startup = json(path.join(root, '.claude/settings.json')).permissions;
  if (Object.keys(profile.permissions).some((key) => !['ask', 'deny'].includes(key))
    || JSON.stringify(profile.permissions.ask) !== JSON.stringify(startup?.ask)
    || profile.permissions.deny.filter((rule) => !/^(Edit|Write)\(/.test(rule))
      .some((rule) => !startup?.deny?.includes(rule))) {
    throw new Error(`${stage}: non-file permissions must match the startup policy`);
  }
  const editDeny = profile.permissions.deny.filter((rule) => /^(Edit|Write)\(/.test(rule)).map((rule) => {
    const match = /^(?:Edit|Write)\(\.\/([^)]*)\)$/.exec(rule);
    if (!match) throw new Error(`Unsupported path rule in ${relative}`);
    return match[1];
  });
  return { id: relative, editDeny };
}

const wildcard = (pattern, value) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replaceAll('?', '.')}$`).test(value);

function checkProfileEdit(profile, root, target) {
  if (profile.editDeny?.some((pattern) => wildcard(pattern, target))) throw new Error(`Stage profile denies ${target}`);
  if (profile.edit) {
    const rules = Object.entries(profile.edit).filter(([pattern]) => wildcard(pattern, target)
      || wildcard(pattern, path.join(root, target)));
    if (rules.at(-1)?.[1] === 'deny') throw new Error(`Stage profile denies ${target}`);
  }
}

function receiptPath(projectRoot, platform, sessionID) {
  if (!nonempty(sessionID) || sessionID.length > 4096) throw new Error('Missing or invalid host session identity');
  const name = createHash('sha256').update(`${platform}:${sessionID}`).digest('hex');
  return path.join(realpathSync(projectRoot), '.agents/mapurito/session-state', `${name}.json`);
}

export function activateSession(root, platform, sessionID) {
  const file = receiptPath(root, platform, sessionID);
  safeRelative(realpathSync(root), file);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ active: true }), { mode: 0o600 });
}

export function sessionIsActive(root, platform, sessionID) {
  if (!nonempty(sessionID)) return false;
  const file = receiptPath(root, platform, sessionID);
  return existsSync(file) && json(file).active === true;
}

export function checkFileOperation(projectRoot, platform, toolName, args = {}, active = false) {
  const tool = ({ multi_edit: 'multiedit', notebook_edit: 'notebookedit' })[toolName.toLowerCase()] ?? toolName.toLowerCase();
  if (!writes.has(tool) && !reads.has(tool)) return { decision: 'normal' };
  try {
    const root = realpathSync(projectRoot);
    const targets = targetPaths(tool, args).map((target) => safeRelative(root, target));
    if (targets.some((target) => target.split('/').some((part) => ['evals', 'legacy'].includes(part)))) {
      throw new Error('Evaluation and legacy material are forbidden');
    }
    if (reads.has(tool)) return { decision: 'normal' };
    for (const target of targets) {
      if (['AGENTS.md', 'CLAUDE.md'].includes(target)
        || protectedRoots.some((prefix) => target === prefix || target.startsWith(`${prefix}/`))) {
        throw new Error(`Protected methodology/input/configuration path: ${target}`);
      }
    }
    if (!active) {
      if (targets.some((target) => target === 'results' || target.startsWith('results/'))) {
        throw new Error('Invoke the Mapurito entry skill before writing methodology results');
      }
      return { decision: 'normal' };
    }
    const current = detectStage(root);
    if (!current.stage) throw new Error('Methodology is complete; no executor write scope remains');
    const profile = loadProfile(root, current.stage, platform);
    for (const target of targets) {
      if (!target.startsWith(`results/${current.stage}/`)) throw new Error(`Only results/${current.stage}/ is writable`);
      if (current.stage === 'ctx00' && target === 'results/ctx00/intake.md'
        && existsSync(path.join(root, target))
        && eventsAt(path.join(root, 'results/ctx00')).some((e) => e.event === 'SUBSTAGE_END' && e.step === 1)) {
        throw new Error('Numbered intake is immutable after step 1');
      }
      checkProfileEdit(profile, root, target);
    }
    return { decision: 'normal', stage: current.stage, profile: profile.id };
  } catch (error) {
    return { decision: 'deny', reason: `Mapurito: ${error.message}` };
  }
}

export function discoverInputs(root) {
  const directory = path.join(root, 'inputs');
  if (!existsSync(directory)) return { action: 'request-upload', files: [] };
  if (realpathSync(directory) !== directory) throw new Error('Symlinked inputs directory');
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && entry.isFile())
    .map((entry) => `inputs/${entry.name}`).sort();
  return { action: files.length === 0 ? 'request-upload' : files.length === 1 ? 'select-single' : 'ask-selection', files };
}

export function statusContext(root, platform, active = false) {
  try {
    const current = detectStage(root);
    const profile = current.stage ? loadProfile(current.root, current.stage, platform).id : 'none';
    const inputs = current.stage === 'ctx00' && current.status === 'not_started'
      ? ` If no explicit input reference was supplied, use this discovery: ${JSON.stringify(discoverInputs(current.root))}. Explicit valid references take priority; verify formats before work.` : '';
    return `Mapurito scope: ${current.stage ?? 'complete'}; status: ${current.status}; profile: ${profile}; execution active in this session: ${active}. For an execution request invoke the Mapurito entry skill (OpenCode: mapurito; Claude: mapurito-claude); its native hook activates the session guard. Read .agents/skills/mapurito/SKILL.md before execution. Select inputs only for a new ctx00; do not treat metadata as approval, a gate verdict or an instruction to start without a user request.${inputs}`;
  } catch (error) {
    return `Mapurito execution blocked: ${error.message}. Inspect existing evidence; do not reset or invent approvals.`;
  }
}

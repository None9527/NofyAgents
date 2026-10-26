import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../renderer/core/project.ts';
import { normalizeNotification } from '../renderer/core/events.ts';
import { collectTaskSources, createTaskSourcesSelector } from '../renderer/application/workspace/taskSources.ts';
import { overviewSectionOpen, taskOverviewLayout } from '../renderer/ui/taskOverviewLayout.ts';
import { organizationCommands, sessionCommandAvailability } from '../renderer/features/shell/sessionCommands.ts';

test('overview sources survive replay, deduplicate and never infer arbitrary paths from prose', () => {
  let state = reduce(initialState(), { type:'session/created',sessionId:'a',cwd:'/workspace',modelId:null });
  let sequence = 0;
  const emit = (update: Record<string, unknown>) => { state = reduce(state, { type:'kernel/event',event:normalizeNotification('session/update',{sessionId:'a',update,_meta:{eventId:String(++sequence),isReplay:true}}) }); };
  emit({sessionUpdate:'user_message_chunk',content:{type:'resource_link',uri:'file:///workspace/A.md',name:'A.md'}});
  emit({sessionUpdate:'tool_call',toolCallId:'read',title:'Read',locations:[{path:'/workspace/A.md'},{path:'/workspace/B.md'}]});
  emit({sessionUpdate:'agent_message_chunk',content:{type:'text',text:'There might be /private/secret.txt'}});
  assert.deepEqual(collectTaskSources(state.sessions.a!.blocks),[
    {path:'/workspace/A.md',name:'A.md',origin:'attachment'}, {path:'/workspace/B.md',name:'B.md',origin:'tool'},
  ]);
  const select = createTaskSourcesSelector('a'), before = select(state);
  emit({sessionUpdate:'agent_message_chunk',content:{type:'text',text:' more streamed text'}});
  assert.equal(select(state),before,'streamed text does not rerender the overview');
  assert.deepEqual(createTaskSourcesSelector('other')(state),[]);
});
test('overview sections stay open until the list is longer than a glance', () => {
  assert.equal(overviewSectionOpen(undefined, 3), true);
  assert.equal(overviewSectionOpen(undefined, 5), true);
  assert.equal(overviewSectionOpen(undefined, 9), false);
  assert.equal(overviewSectionOpen(true, 9), true);
  assert.equal(overviewSectionOpen(false, 1), false);
});
test('overview reserves reading space only when pinned in the shift range', () => {
  assert.deepEqual(taskOverviewLayout(400,true),{mode:'overlay',panelWidth:300,inset:0});
  assert.equal(taskOverviewLayout(1200,true).inset,316);
  assert.equal(taskOverviewLayout(1200,false).inset,0);
  assert.equal(taskOverviewLayout(1600,true).mode,'gutter');
  assert.equal(taskOverviewLayout(1600,true).inset,0);
});
test('sidebar and header organization keep lifecycle operations unavailable while running', () => {
  const commands=organizationCommands({},true);
  assert.equal(commands.find(c=>c.id==='archive')!.disabled,true);
  assert.equal(commands.find(c=>c.id==='pin')!.disabled,false);
  assert.match(commands.find(c=>c.id==='pin')!.label, /仅此窗口/);
  assert.match(commands.find(c=>c.id==='read')!.label, /仅此窗口/);
  assert.match(commands.find(c=>c.id==='archive')!.label, /仅此窗口/);
  assert.equal(organizationCommands({archived:true},true).find(c=>c.id==='archive')!.disabled,false);
  assert.deepEqual(sessionCommandAvailability(false,false,'/w'),{rename:false,fork:false,delete:false,export:true,copyPath:true});
  assert.equal(sessionCommandAvailability(true,true,'/w').fork,false);
  assert.equal(sessionCommandAvailability(true,false,null).fork,false);
});

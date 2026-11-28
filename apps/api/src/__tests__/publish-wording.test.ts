import {describe,it,expect,beforeAll} from 'vitest';

let wording:typeof import('../modules/content/publish.service.js').wording,reachesLiveSite:typeof import('../modules/content/publish.service.js').reachesLiveSite;
beforeAll(async()=>{
 Object.assign(process.env,{NODE_ENV:'test',JWT_SECRET:'x'.repeat(40),DATABASE_URL:'mysql://u:p@127.0.0.1:1/none'});
 ({wording,reachesLiveSite}=await import('../modules/content/publish.service.js'));
});

describe('publish wording depends on the destination branch',()=>{
 it('only main reaches the live site',()=>{
  expect(reachesLiveSite('main')).toBe(true);
  expect(reachesLiveSite('cms/publish')).toBe(false);
 });
 it('a review branch says it does not update the live site and never implies a rebuild',()=>{
  for(const action of ['publish','undo'] as const){
   const m=wording('sent',action,'cms/publish');
   expect(m).toContain('cms/publish');
   expect(m).toMatch(/live site/i);
   expect(m).not.toMatch(/rebuild finishes/i);
  }
  expect(wording('sent','publish','cms/publish')).toMatch(/does not update the live site/);
  expect(wording('sent','undo','cms/publish')).toMatch(/live site was not changed/);
 });
 it('failure messages name the review branch, not the website repository',()=>{
  for(const o of ['no_changes','conflict','refused','failed'] as const)expect(wording(o,'publish','cms/publish')).not.toContain('website repository');
 });
 it('main keeps the original rebuild wording',()=>{
  expect(wording('sent','publish','main')).toMatch(/live site changes only after the website rebuild/);
  expect(wording('sent','undo','main')).toMatch(/reverted/);
 });
});

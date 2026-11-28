import {useState} from 'react';
import {post} from '../lib/api.js';
import {usePublishStatus,useLiveStatus} from '../lib/publishMode.js';
type Result={outcome:string;message:string;commit?:string};
export function Publish(){
 const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
 const q=usePublishStatus();const live=useLiveStatus(!!q.data?.enabled&&!!q.data?.reachesLiveSite);
 async function act(kind:'publish'|'undo'){
  const review=!q.data?.reachesLiveSite;const b=q.data?.branch||'';
  const ask=review?(kind==='publish'?`Send the approved content to the review branch "${b}"? This does not update the live site.`:`Undo the last CMS send on the review branch "${b}"? This does not update the live site.`):(kind==='publish'?'Send the approved content to the website repository now? The live site will change after its rebuild.':'Undo the last CMS send in the website repository? The live site will change after its rebuild.');
  if(!window.confirm(ask))return;
  setBusy(true);setMsg('');
  try{const r=await post<Result>('/admin/publish/'+kind,{confirm:true});await q.refetch();await live.refetch();setMsg(r.message+(r.commit?' Commit '+r.commit.slice(0,7)+'.':''))}
  catch(e){await q.refetch();const m=(e as {response?:{data?:{error?:{message?:string}}}}).response?.data?.error?.message;setMsg(m||'Nothing was sent. The request failed.')}finally{setBusy(false)}
 }
 const off=q.isError||!q.data?.enabled;const review=!q.data?.reachesLiveSite;
 return <div><h1>Send to website</h1>
  {review?<p>Sends the approved (published) content to the review branch{q.data?.branch?` "${q.data.branch}"`:''} of the website repository. Drafts are never sent. <strong>This does not update the live site.</strong> The live site changes only after someone merges that branch into the main branch.</p>
  :<p>Sends the approved (published) content to the live website. Drafts and archived posts are never sent. <strong>This updates the live site</strong> once the website rebuilds, which can take a few minutes. The status below shows whether the live site is serving exactly what was sent.</p>}
  {off&&<p role="alert">Sending is not enabled in this environment.</p>}
  <button className="review-primary" disabled={busy||off} onClick={()=>act('publish')}>Send approved content</button>
  <button disabled={busy||off} onClick={()=>act('undo')}>Undo last send</button>
  {msg&&<p role="status">{msg}</p>}
  <p>{q.data?.last?`Last recorded attempt: ${q.data.last.action} (${q.data.last.outcome.replace('_',' ')}) at ${new Date(q.data.last.at).toLocaleString()}${q.data.last.commit?', commit '+q.data.last.commit.slice(0,7):''}.`:'No send recorded yet.'}</p>
  {!review&&<p role="status" data-live-state={live.data?.state||'unknown'}>{live.isLoading?'Checking the live site...':liveText(live.data)}</p>}</div>
}
function liveText(l?:{state:string;detail:string;last:null|{action:string}}){
 if(!l)return 'Live status could not be checked right now.';
 if(!l.last)return 'Live status: nothing to compare yet. '+l.detail;
 if(l.state==='live')return 'Live status: confirmed. '+l.detail;
 if(l.state==='not_yet')return 'Live status: not live yet. '+l.detail+' If this does not change after several minutes, ask your developer to check the website rebuild.';
 return 'Live status: not confirmed. '+l.detail;
}

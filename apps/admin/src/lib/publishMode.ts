import {useQuery} from '@tanstack/react-query';
import {get} from './api.js';
export type PublishStatus={enabled:boolean;branch:string|null;reachesLiveSite:boolean;last:null|{action:string;outcome:string;commit?:string|null;at:string;contentVersion?:string}};
export type LiveStatus={state:'live'|'not_yet'|'unknown';detail:string;last:null|{action:string;outcome:string;commit?:string|null;at:string}};
// Shared by the pages that talk about publishing, so their wording matches where "Send to website" really goes.
// While loading or on error the review wording is kept: never claim the live site is affected until the server says so.
export const usePublishStatus=()=>useQuery({queryKey:['publish-status'],queryFn:()=>get<PublishStatus>('/admin/publish'),retry:false});
export const useLiveStatus=(enabled:boolean)=>useQuery({queryKey:['publish-live-status'],queryFn:()=>get<LiveStatus>('/admin/publish/live-status'),retry:false,enabled,refetchInterval:enabled?30000:false});
export const goesLive=(s?:PublishStatus)=>!!s?.enabled&&!!s.reachesLiveSite;

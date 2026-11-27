import {useRef,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {api,get} from '../lib/api.js';
type Item={id:string;url:string;originalName:string;mimeType:string;altText:string|null};
// Lets editors pick an uploaded image or upload a new one. Writes only a local /uploads/ path into the field.
export function ImagePicker({value,onPick}:{value:string;onPick:(url:string)=>void}){
 const qc=useQueryClient();const file=useRef<HTMLInputElement>(null);const[alt,setAlt]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);
 const q=useQuery({queryKey:['admin-media'],queryFn:()=>get<Item[]>('/admin/media'),retry:false});
 async function upload(f:File){
  setBusy(true);setError('');
  try{
   if(f.size>5*1024*1024)throw new Error('Image must be 5 MB or smaller');
   const fd=new FormData();fd.append('file',f);if(alt.trim())fd.append('altText',alt.trim());
   const res=await api.post('/admin/media',fd,{headers:{'Content-Type':'multipart/form-data'}});
   if(!res.data.success)throw new Error(res.data.error?.message??'Upload failed');
   onPick(res.data.data.url);setAlt('');if(file.current)file.current.value='';await qc.invalidateQueries({queryKey:['admin-media']});
  }catch(e){const m=(e as {response?:{data?:{error?:{message?:string}}}}).response?.data?.error?.message;setError(m??(e instanceof Error?e.message:'Upload failed'))}finally{setBusy(false)}
 }
 const uploads=(q.data??[]).filter(m=>m.mimeType.startsWith('image/'));
 return <div className="image-picker">
  {value&&<img src={value} alt="" className="image-picker__preview"/>}
  <label>Choose an uploaded image<select className="yk-select" value={uploads.some(m=>m.url===value)?value:''} onChange={e=>e.target.value&&onPick(e.target.value)}><option value="">Keep current</option>{uploads.map(m=><option key={m.id} value={m.url}>{m.originalName}{m.altText?' · '+m.altText:''}</option>)}</select></label>
  <label>Alt text for a new upload<input className="yk-input" value={alt} maxLength={300} onChange={e=>setAlt(e.target.value)}/></label>
  <label>Upload image (JPEG, PNG or WebP, 5 MB max)<input ref={file} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label>
  {busy&&<p role="status">Uploading</p>}{error&&<p role="alert">{error}</p>}
 </div>;
}

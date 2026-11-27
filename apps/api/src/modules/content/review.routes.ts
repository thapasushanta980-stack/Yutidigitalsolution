import {Router} from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {z} from 'zod';
import {verifyToken,requireRole} from '../../middlewares/auth.js';
import {validate} from '../../middlewares/validate.js';
import {asyncHandler,ok} from '../../utils/http.js';
import * as service from './review.service.js';
export const adminReviewRouter=Router();
adminReviewRouter.use(verifyToken,requireRole('SUPER_ADMIN','ADMIN','EDITOR'));
adminReviewRouter.use((_req,res,next)=>{res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('Cache-Control','no-store');next()});
adminReviewRouter.get('/',asyncHandler(async(_req,res)=>ok(res,service.status())));
adminReviewRouter.post('/build',validate({body:z.object({mode:z.enum(['draft','published'])}).strict()}),asyncHandler(async(req,res)=>{res.status(202);return ok(res,await service.start(req.body.mode))}));
adminReviewRouter.post('/select',validate({body:z.object({id:z.string().max(100)}).strict()}),asyncHandler(async(req,res)=>ok(res,service.select(req.body.id))));
adminReviewRouter.get('/preview/:id/*',asyncHandler(async(req,res)=>{
 let requested=req.params[0]||'index.html';if(!path.extname(requested))requested=path.join(requested,'index.html');
 const file=service.releaseFile(req.params.id,requested);
 res.setHeader('Content-Security-Policy',"default-src 'self' data:; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'");
 if(file.endsWith('.html')){const prefix=`/api/v1/admin/review/preview/${req.params.id}`;let html=fs.readFileSync(file,'utf8');html=html.replace(/\b(src|href)="\/(?!\/)([^"]*)"/g,(_m,attribute,tail)=>`${attribute}="${prefix}/${tail}"`);html=html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,'<p role="note">Booking calendar disabled in this read-only preview.</p>').replace('Loading calendar...','Calendar disabled in preview').replace(/\sloading="lazy"/g,' loading="eager"').replace('</head>','<style>.motion-boot h1,.motion-boot h2,.motion-boot .lead{opacity:1!important;visibility:visible!important}iframe{display:none!important}</style></head>');res.type('html').send(html);return;}
 res.sendFile(file);
}));

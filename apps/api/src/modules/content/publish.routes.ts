import {Router} from 'express';
import {z} from 'zod';
import {verifyToken,requireRole} from '../../middlewares/auth.js';
import {validate} from '../../middlewares/validate.js';
import {asyncHandler,ok} from '../../utils/http.js';
import * as service from './publish.service.js';
// Same roles as approving page content (content.routes): EDITOR and above. Dormant unless CMS_PUBLISH_ENABLED=true. The client review gateway does not forward this path.
export const adminPublishRouter=Router();
adminPublishRouter.use(verifyToken,requireRole('SUPER_ADMIN','ADMIN','EDITOR'));
adminPublishRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next()});
const confirm=validate({body:z.object({confirm:z.literal(true)}).strict()});
adminPublishRouter.get('/',asyncHandler(async(_req,res)=>ok(res,{enabled:service.enabled(),branch:service.enabled()?service.config().branch:null,reachesLiveSite:service.enabled()?service.reachesLiveSite(service.config().branch):false,last:service.enabled()?await service.lastAttempt():null})));
adminPublishRouter.post('/publish',confirm,asyncHandler(async(req,res)=>ok(res,await service.perform('publish',req.user?.id))));
adminPublishRouter.post('/undo',confirm,asyncHandler(async(req,res)=>ok(res,await service.perform('undo',req.user?.id))));

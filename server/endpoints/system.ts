import { Router } from 'express';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { pingSystem } from '../controllers/system/pingSystem';
import { setupComplete } from '../controllers/system/setupComplete';
import { requestToken } from '../controllers/system/requestToken';
import { updatePassword } from '../controllers/system/updatePassword';
import { checkToken } from '../controllers/system/checkToken';
import { updateEnv } from '../controllers/system/updateEnv';

export const systemEndpoints = (app: Router) => {
  if (!app) return;

  app.get('/ping', pingSystem);

  app.get('/setup-complete', setupComplete);

  app.post('/request-token', requestToken);

  app.post('/system/update-password', [validatedRequest], updatePassword);

  app.get('/system/check-token', [validatedRequest], checkToken);

  app.post('/system/update-env', [validatedRequest], updateEnv);
};

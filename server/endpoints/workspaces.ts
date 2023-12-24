import { Router } from 'express';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { updateEmbeddings } from '../controllers/workspaces/updateEmbeddings';
import { createNewWorkspace } from '../controllers/workspaces/createNewWorkspace';
import { updateWorkspace } from '../controllers/workspaces/updateWorkspace';
import { getWorkspaces } from '../controllers/workspaces/getWorkspaces';
import { GetWorkspace } from '../controllers/workspaces/getWorkspace';

export const workspaceEndpoints = (app: Router) => {
  if (!app) return;

  app.post('/workspace/new', [validatedRequest], createNewWorkspace);

  app.put('/workspace/:slug/update', [validatedRequest], updateWorkspace);

  app.get('/workspaces', [validatedRequest], getWorkspaces);

  app.get('/workspace/:slug', [validatedRequest], GetWorkspace);

  app.post('/workspace/:slug/update-embeddings', [validatedRequest], updateEmbeddings);
};

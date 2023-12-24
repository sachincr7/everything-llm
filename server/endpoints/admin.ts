import { Router } from 'express';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { createUser } from '../controllers/admin/createUser';
import { getUsers } from '../controllers/admin/getUsers';
import { updateUser } from '../controllers/admin/updateUser';
import { archiveUser } from '../controllers/admin/archiveUser';

function adminEndpoints(app: Router) {
  if (!app) return;

  app.post('/admin/users/new', [validatedRequest], createUser);

  app.get('/admin/users', [validatedRequest], getUsers);

  app.put('/admin/user/:id', [validatedRequest], updateUser);

  app.delete('/admin/user/:id', [validatedRequest], archiveUser);
}

export { adminEndpoints };

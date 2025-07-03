import { Router } from 'express';
import { adminAuth, authorizeMenuAccess } from "../../../../middlewares/admin/auth";
import {
  createUser,
  getUsers,
} from '../../../../controllers/admin-api/manageuser/CreateReadUser';

const router = Router();

router.post(
  '/users',
  adminAuth,
  authorizeMenuAccess("manageuser"),
  createUser
);

router.get(
  '/users',
  adminAuth,
  authorizeMenuAccess("manageuser"),
  getUsers
);

export default router;

//main route
import { Router } from 'express';
import login from '../../controllers/admin-api/auth';
import profilecontroller from '../../routes/admin-api/admin/ProfileController';

//route superadmin
import crudadmin from './admin/manageadmin/CrudAdmin';
import crudadminroles from './admin/manageadmin/CrudAdminRoles';
import adminnotification from './admin/notification'

//route menuseed
import Seed from './Seed';

//route dealer
import cruddealer from '../admin-api/admin/managedealer/CrudDealer';

//route user
import CrudUser from './admin/manageuser/CrudUser';
//route email
import email from '../admin-api/email/email';

//route product
import CrudProduct from './product/ManageProduct/CrudProduct';



//route price
import CrudPrice from './product/ManagePrice/CrudPrice';
import CrudPriceCategory from './product/ManagePrice/CrudPriceCategory';

import CrudTransaction from './transaction/salesorder'

import Statistic from './statistic/transaction';

import {getAdminAccessMatrix,updateRoleMenuAccess} from '../../controllers/admin-api/manageadmin/access/access';

const adminApiRouter = Router();

// Rute untuk menu utama
adminApiRouter.use('/admin',login)
adminApiRouter.use('/admin',profilecontroller)

//rute untuk access
adminApiRouter.get('/admin/access', getAdminAccessMatrix);
adminApiRouter.put('/admin/access/update', updateRoleMenuAccess);

//rute untuk seed menu
adminApiRouter.use('/admin', Seed);

//rute admin
adminApiRouter.use('/admin',crudadmin)
adminApiRouter.use('/admin',crudadminroles)
adminApiRouter.use('/admin',adminnotification)

//rute dealer
adminApiRouter.use('/admin',cruddealer)

//rute user
adminApiRouter.use('/admin',CrudUser)
//rute email
adminApiRouter.use('/admin',email)

//rute untuk product
adminApiRouter.use('/admin',CrudProduct)
adminApiRouter.use('/admin',CrudPriceCategory)


//rute untuk price
adminApiRouter.use('/admin',CrudPrice)

//rute untuk transaction
adminApiRouter.use('/admin',CrudTransaction)

//rute untuk statistic
adminApiRouter.use('/admin',Statistic)

export default adminApiRouter;

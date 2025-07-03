// src/types/express/index.d.ts
import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      Id: number;
      Username: string;
      Email: string;
    };
    admin?: {
      Id: number;
      Username: string;
      Role: string;
      RoleId: number;
      SalesId?: number;
    };
  }
}

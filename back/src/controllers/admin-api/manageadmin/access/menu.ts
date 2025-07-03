import { Request, Response } from "express";
import { PrismaClient, AccessLevel, EmailTemplateType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function deleteMenuDuplicates() {
  const allMenus = await prisma.menu.findMany({
    select: { Id: true, Name: true, Path: true },
    orderBy: { Id: 'asc' },
  });
  const menuMap: Record<string, number[]> = {};
  for (const m of allMenus) {
    // Kombinasi Name + Path dijadikan acuan unik
    const key = `${m.Name}__${m.Path}`;
    if (!menuMap[key]) menuMap[key] = [];
    menuMap[key].push(m.Id);
  }
  const idsToDelete: number[] = [];
  for (const ids of Object.values(menuMap)) {
    if (ids.length > 1) {
      idsToDelete.push(...ids.slice(1));
    }
  }
  if (idsToDelete.length > 0) {
    await prisma.menu.deleteMany({
      where: { Id: { in: idsToDelete } },
    });
    console.log('Menu duplikat terhapus:', idsToDelete.length);
  }
}

async function seedEmailTemplatesAndConfig() {
  // === [EMAIL CONFIG] ===
  await prisma.emailConfig.upsert({
    where: { Email: "steven@sunway.com.my" },
    update: {
      Password: "password-email", // GANTI password asli
      Host: "smtp.gmail.com",
      Port: 465,
      Secure: true,
      IsActive: true,
    },
    create: {
      Email: "steven@sunway.com.my",
      Password: "password-email", // GANTI password asli
      Host: "smtp.gmail.com",
      Port: 465,
      Secure: true,
      IsActive: true,
    },
  });

  // === [EMAIL TEMPLATE - SALES_ORDER] ===
  const templateType = EmailTemplateType.SALES_ORDER;
  const templateSubject = "[SALES ORDER] - {{sales_order_number}}";
  const templateBody = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
  <b>Nomor Sales Order:</b> {{sales_order_number}}<br>
  <b>Tanggal Order:</b> {{created_date}}<br>
  <b>Nama Pelanggan:</b> {{dealer}}<br>
  <b>Sales Representative:</b> {{sales}}<br>
  <b>Nomor Sales Order JDE:</b> {{JDE}}<br>
  <br>
  <b>PT. SUNWAY TREK MASINDO</b><br>
  Jl. Kosambi Timur No.47<br>
  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>
  15211 Dadap – Tangerang, Indonesia<br>
  <br>
  📞 Tel: +62 55955445<br>
  📠 Fax: +62 55963153<br>
  📱 Mobile: +62 81398388788<br>
  ✉️ Email: steven@sunway.com.my<br>
  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>
  <br>
  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>
  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>
  <br>
  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>
  <br>
  For more information about Sunway Group, please visit:<br>
  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>
  <br>
  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>
  <br>
  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>
  <br>
  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>
  &nbsp;|&nbsp;
  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>
</div>`;

  // find template by TemplateType (enum)
  const existingTemplate = await prisma.emailTemplate.findFirst({
    where: {
      TemplateType: templateType,
      DeletedAt: null,
    },
  });

  if (existingTemplate) {
    // update by Id
    await prisma.emailTemplate.update({
      where: { Id: existingTemplate.Id },
      data: {
        Name: "SALES_ORDER_DEFAULT",
        Subject: templateSubject,
        Body: templateBody,
        TemplateType: templateType,
      },
    });
    console.log("[SEED] EmailTemplate SALES_ORDER updated");
  } else {
    // create new
    await prisma.emailTemplate.create({
      data: {
        Name: "SALES_ORDER_DEFAULT",
        Subject: templateSubject,
        Body: templateBody,
        TemplateType: templateType,
      },
    });
    console.log("[SEED] EmailTemplate SALES_ORDER created");
  }
}

seedEmailTemplatesAndConfig()
  .then(() => {
    console.log('Seeding email config & template selesai');
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error('Seeding error:', err);
    prisma.$disconnect();
    process.exit(1);
  });


export const seedAdminMenuAccess = async (req: Request, res: Response) => {
  try {

    //await seedEmailTemplatesAndConfig();
    // 0. Truncate tabel & reset auto-increment
    await prisma.roleMenuFeatureAccess.deleteMany({});
    await prisma.roleMenuAccess.deleteMany({});
    await prisma.menuFeature.deleteMany({});
    await prisma.menu.deleteMany({});

    // (Optional) Reset auto-increment/sequence jika ingin ID mulai dari 1
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "RoleMenuFeatureAccess_Id_seq" RESTART WITH 1`);
await prisma.$executeRawUnsafe(`ALTER SEQUENCE "RoleMenuAccess_Id_seq" RESTART WITH 1`);
await prisma.$executeRawUnsafe(`ALTER SEQUENCE "MenuFeature_Id_seq" RESTART WITH 1`);
await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Menu_Id_seq" RESTART WITH 1`);

    await deleteMenuDuplicates();
    // 1. Seed Roles
    const rolesData = [
      { Name: "SuperAdmin", Description: "Super administrator full access" },
      { Name: "Sales", Description: "Sales" },
      { Name: "SalesSupport", Description: "Sales support limited access" },
      { Name: "InventoryManager", Description: "Manager inventory" },
    ];
    const roles: Record<string, any> = {};
    for (const role of rolesData) {
      let existing = await prisma.adminRole.findFirst({ where: { Name: role.Name } });
      let upserted;
      if (existing) {
        upserted = await prisma.adminRole.update({ where: { Id: existing.Id }, data: role });
      } else {
        upserted = await prisma.adminRole.create({ data: role });
      }
      roles[role.Name] = upserted;
    }

    // 2. Daftar menu dan fitur (dari sidebar/halaman admin)
    const menus = [
      {
        Name: "manageadmin",
        Path: "/listpeople/manageadmin",
        Description: "Manajemen user admin",
        Features: ["create","edit", "setsales","session", "sendforgotpassword", "delete"],
      },
      {
        Name: "emailsetting",
        Path: "/email/emailsetting",
        Description: "Manajemen email & template",
        Features: ["setconfig", "createtemplate", "editemplate", "deletetemplate"],
      },
       {
    Name: "approvesalesorder",
    Path: "/listapprovalsalesorder/approvalsalesorder",
    Description: "Approve Sales Order",
    Features: ["listemailrecipient","createupdatedeleteemailrecipient", "taxconfig", "reviewsalesorder"],
  },
  {
    Name: "salesorder",
    Path: "/listtransaction/transaction",
    Description: "Sales Order",
    Features: ["editsalesorder", "deletesalesorder"],
  },
  {
    Name: "statistic",
    Path: "/liststatistic/statistic",
    Description: "Statistic / Laporan",
    Features: [],
  },
  {
    Name: "stock",
    Path: "/liststock/stock",
    Description: "Stock Management",
    Features: ["managewarehouse","updateexcel","editstockmanual"],
  },
  {
    Name: "product",
    Path: "/productsetting/product",
    Description: "Product Management",
    Features: ["managecategory","createproduct","editproduct","deleteproduct" ],
  },
  {
    Name: "sales",
    Path: "/listsales/sales",
    Description: "Sales List",
    Features: [],
  },
  {
    Name: "price",
    Path: "/listprice/price",
    Description: "Price Management",
    Features: ["managepricecategory", "addprice","editprice","deleteprice"],
  },
  // Daftar menu lain di "Other" sidebar
  {
    Name: "rolemenuaccess",
    Path: "/listpeople/manageadmin/RoleMenuAccess",
    Description: "Role Menu Access Setting",
    Features: [],
  },
  {
    Name: "manageuser",
    Path: "/listpeople/listuser/user",
    Description: "Manage User",
    Features: [],
  },
  {
    Name: "managedealer",
    Path: "/listdealer/dealer",
    Description: "Manage Dealer",
    Features: ["create","edit","delete","editwarehousepriority"],
  },
  {
    Name: "stockhistory",
    Path: "/liststock/StockHistory",
    Description: "Stock History",
    Features: [],
  },
    ];

    // Untuk mapping Id menu dan Id fitur
    const menuMap: Record<string, any> = {};
    const featureMap: Record<string, any> = {};

    // 3. Seed Menu & MenuFeature
    for (const menu of menus) {
      let existingMenu = await prisma.menu.findFirst({ where: { Path: menu.Path } });
      let upsertedMenu;
      if (existingMenu) {
        upsertedMenu = await prisma.menu.update({ where: { Id: existingMenu.Id }, data: {
          Name: menu.Name,
          Path: menu.Path,
          Description: menu.Description,
        }});
      } else {
        upsertedMenu = await prisma.menu.create({
          data: {
            Name: menu.Name,
            Path: menu.Path,
            Description: menu.Description,
          },
        });
      }
      menuMap[menu.Name] = upsertedMenu;

      // 3b. MenuFeature
      for (const feature of menu.Features) {
        let existingFeature = await prisma.menuFeature.findFirst({
          where: { MenuId: upsertedMenu.Id, Feature: feature },
        });
        let upsertedFeature;
        if (existingFeature) {
          upsertedFeature = await prisma.menuFeature.update({
            where: { Id: existingFeature.Id },
            data: { Feature: feature, MenuId: upsertedMenu.Id },
          });
        } else {
          upsertedFeature = await prisma.menuFeature.create({
            data: { Feature: feature, MenuId: upsertedMenu.Id },
          });
        }
        featureMap[`${menu.Name}-${feature}`] = upsertedFeature;
      }
    }

    // 4. Seed Admin
    const passwordHash = await bcrypt.hash("password", 10);
    const adminsData = [
      {
        Username: "superadmin",
        Password: passwordHash,
        Email: "superadmin@sunway.com",
        RoleId: roles.SuperAdmin.Id,
      },
     {
        Username: "Togar",
        Password: passwordHash,
        Email: "Togar@sunway.com",
        RoleId: roles.SuperAdmin.Id,
      },
      {
        Username: "Andry",
        Password: passwordHash,
        Email: "Andry@sunway.com",
        RoleId: roles.SuperAdmin.Id,
      },
      {
        Username: "Rendy",
        Password: passwordHash,
        Email: "Rendy@sunway.com",
        RoleId: roles.SuperAdmin.Id,
      },
    ];
    for (const admin of adminsData) {
      let existing = await prisma.admin.findFirst({ where: { Username: admin.Username } });
      if (existing) {
        await prisma.admin.update({ where: { Id: existing.Id }, data: admin });
      } else {
        await prisma.admin.create({ data: admin });
      }
    }

    // 5. RoleMenuAccess (akses role ke menu)
    for (const roleName in roles) {
      for (const menu of menus) {
        let existing = await prisma.roleMenuAccess.findFirst({
          where: { RoleId: roles[roleName].Id, MenuId: menuMap[menu.Name].Id },
        });
        if (existing) {
          await prisma.roleMenuAccess.update({
            where: { Id: existing.Id },
            data: { Access: "WRITE" },
          });
        } else {
          await prisma.roleMenuAccess.create({
            data: {
              RoleId: roles[roleName].Id,
              MenuId: menuMap[menu.Name].Id,
              Access: "WRITE",
            },
          });
        }
      }
    }

    // 6. RoleMenuFeatureAccess (akses role ke fitur menu)
    for (const roleName in roles) {
      for (const menu of menus) {
        for (const feature of menu.Features) {
          let existing = await prisma.roleMenuFeatureAccess.findFirst({
            where: {
              RoleId: roles[roleName].Id,
              MenuFeatureId: featureMap[`${menu.Name}-${feature}`].Id,
            },
          });
          if (existing) {
            await prisma.roleMenuFeatureAccess.update({
              where: { Id: existing.Id },
              data: { Access: "WRITE" },
            });
          } else {
            await prisma.roleMenuFeatureAccess.create({
              data: {
                RoleId: roles[roleName].Id,
                MenuFeatureId: featureMap[`${menu.Name}-${feature}`].Id,
                Access: "WRITE",
              },
            });
          }
        }
      }
    }

    

    res.status(200).json({
      message: "Seeded SuperAdmin & SalesSupport with menu/features access",
      menus: menuMap,
      features: featureMap,
    });
  } 
  catch (error: any) {
    console.error("Seed error:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
};

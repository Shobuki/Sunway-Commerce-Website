import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { CartItem } from "@prisma/client";


const prisma = new PrismaClient();

export const addUpdateCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginUser = req.user;
    let { UserId, ItemCodeId, Quantity, mode } = req.body;


    if (!loginUser || Number(UserId) !== Number(loginUser.Id)) {
      res.status(403).json({ message: "Access denied. Token tidak sesuai user login." });
      return;
    }

    if (!UserId || !ItemCodeId || Quantity === undefined) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
    if (Quantity <= 0) {
      const cart = await prisma.cart.findUnique({
        where: { UserId: Number(UserId) },
        include: { CartItems: true }
      });

      if (!cart) {
        res.status(404).json({ message: "Cart not found." });
        return;
      }

      const existingItem = cart.CartItems.find(ci => ci.ItemCodeId === Number(ItemCodeId));

      if (!existingItem) {
        res.status(404).json({ message: "Cart item not found." });
        return;
      }

      await prisma.cartItem.delete({ where: { Id: existingItem.Id } });

      const remainingItems = await prisma.cartItem.findMany({
        where: { CartId: cart.Id }
      });

      if (remainingItems.length === 0) {
        await prisma.cart.delete({ where: { Id: cart.Id } });
        res.status(200).json({ message: "Item removed and cart deleted (empty)." });
      } else {
        res.status(200).json({ message: "Item removed from cart." });
      }

      return; // ⛔ pastikan return di sini agar tidak lanjut ke bawah
    }

// Step 1: Ambil dealer dan warehouse prioritas
    const user = await prisma.user.findUnique({
      where: { Id: Number(UserId) },
      include: { Dealer: { include: { PriceCategory: true } } }
    });
    if (!user || !user.Dealer) {
      res.status(400).json({ message: "User is not associated with a dealer." });
      return;
    }
    const dealerId = user.Dealer.Id;
    const priceCategoryId = user.Dealer.PriceCategoryId;

    // Step 2: Ambil semua ItemCode dari PartNumber (AllowItemCodeSelection=false)
    const requestItem = await prisma.itemCode.findUnique({
  where: { Id: Number(ItemCodeId), DeletedAt: null },
  include: {
    PartNumber: true,
    Price: {  // ⬅️ tambahkan ini!
      where: { DeletedAt: null },
      include: { WholesalePrices: { where: { DeletedAt: null } } }
    },
    WarehouseStocks: { where: { DeletedAt: null } }, // ⬅️ tambahkan ini!
  }
});

    if (!requestItem) {
      res.status(404).json({ message: "ItemCode not found." });
      return;
    }
// Setelah requestItem diambil...
if (requestItem.AllowItemCodeSelection) {
  // 1. Cek harga valid
  const hasValidPrice = requestItem.Price.some(p =>
    (p.DealerId === dealerId && p.PriceCategoryId == null) ||
    (p.DealerId == null && p.PriceCategoryId === priceCategoryId) ||
    (p.WholesalePrices && p.WholesalePrices.length > 0)
  );
  if (!hasValidPrice) {
    res.status(400).json({ message: "ItemCode tidak memiliki harga aktif untuk dealer ini." });
    return;
  }
  // 2. Cek stok valid
  const totalStock = requestItem.WarehouseStocks.reduce((sum, ws) => sum + ws.QtyOnHand, 0);
  if (totalStock < Quantity) {
    res.status(400).json({ message: "Stok tidak cukup untuk ItemCode yang dipilih.", detail: { Needed: Quantity, Available: totalStock } });
    return;
  }
  // 3. Validasi MinOrder dan Step
  if (requestItem.MinOrderQuantity && Quantity < requestItem.MinOrderQuantity) {
    res.status(400).json({ message: `Minimum order quantity is ${requestItem.MinOrderQuantity}` });
    return;
  }
  if (requestItem.OrderStep && Quantity % requestItem.OrderStep !== 0) {
    res.status(400).json({ message: `Quantity must be multiples of ${requestItem.OrderStep}` });
    return;
  }
  // 4. Proses add/update cart pakai ItemCodeId yang dipilih user
  let cart = await prisma.cart.findUnique({
    where: { UserId: Number(UserId) },
    include: { CartItems: { include: { ItemCode: true } } }
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        UserId: Number(UserId),
        CartItems: { create: [{ ItemCodeId: requestItem.Id, Quantity }] }
      },
      include: { CartItems: { include: { ItemCode: true } } }
    });
    res.status(201).json({
      message: "Cart created and item added.",
      FinalItemCodeId: requestItem.Id,
      data: cart
    });
    return;
  }
  const existingExact = cart.CartItems.find(ci => ci.ItemCodeId === requestItem.Id);
  if (existingExact) {
    const newQty = mode === "increment" ? existingExact.Quantity + Quantity : Quantity;
    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { Id: existingExact.Id } });
      const remainingItems = await prisma.cartItem.findMany({ where: { CartId: cart.Id } });
      if (remainingItems.length === 0) {
        await prisma.cart.delete({ where: { Id: cart.Id } });
        res.status(200).json({ message: "Cart emptied because all items removed." });
      } else {
        res.status(200).json({ message: "Item removed from cart." });
      }
      return;
    }
    await prisma.cartItem.update({
      where: { Id: existingExact.Id },
      data: { Quantity: newQty }
    });
    res.status(200).json({
      message: "Cart updated.",
      FinalItemCodeId: requestItem.Id
    });
    return;
  }
  // Hapus CartItem lain pada partnumber selain yang terpilih
  for (const ci of cart.CartItems) {
    if (ci.ItemCode.PartNumberId === requestItem.PartNumberId && ci.ItemCodeId !== requestItem.Id) {
      await prisma.cartItem.delete({ where: { Id: ci.Id } });
    }
  }
  await prisma.cartItem.create({
    data: { CartId: cart.Id, ItemCodeId: requestItem.Id, Quantity }
  });
  res.status(201).json({
    message: "Item added to cart.",
    FinalItemCodeId: requestItem.Id
  });
  return; // ⛔ Penting: langsung return, jangan lanjut ke bawah!
}


    const partNumberId = requestItem.PartNumberId;
    const itemCodes = await prisma.itemCode.findMany({
      where: {
        PartNumberId: partNumberId,
        AllowItemCodeSelection: false,
        DeletedAt: null
      },
      include: {
        WarehouseStocks: { where: { DeletedAt: null } },
        Price: {
          where: { DeletedAt: null },
          include: { WholesalePrices: { where: { DeletedAt: null } } }
        }
      }
    });

    // Step 3: Filter hanya itemcode yang punya harga valid
    const validItemCodes = itemCodes.filter(item =>
      item.Price.some(p =>
        (p.DealerId === dealerId && p.PriceCategoryId == null) ||
        (p.DealerId == null && p.PriceCategoryId === priceCategoryId) ||
        (p.WholesalePrices && p.WholesalePrices.length > 0)
      )
    );
    if (validItemCodes.length === 0) {
      res.status(400).json({ message: "Tidak ada item dengan harga aktif untuk dealer ini." });
      return;
    }

    // Step 4: Ambil urutan dealer-warehouse
    const dealerWarehouses = await prisma.dealerWarehouse.findMany({
      where: { DealerId: dealerId },
      orderBy: { Priority: "asc" },
      select: { WarehouseId: true, Priority: true }
    });
    const warehouseDealerIds = dealerWarehouses.map(dw => dw.WarehouseId);

    // Step 5: Susun kandidat kombinasi warehouse dalam dealer-warehouse
    // Susun {ItemCodeId, warehouseId, stok} urut dealer-warehouse priority dulu, baru warehouse luar
    const warehouseBreakdown: { ItemCodeId: number; WarehouseId: number; QtyOnHand: number }[] = [];

    validItemCodes.forEach(item => {
      // warehouse dealer-warehouse (priority dulu)
      item.WarehouseStocks.forEach(ws => {
        if (warehouseDealerIds.includes(ws.WarehouseId) && ws.QtyOnHand > 0) {
          warehouseBreakdown.push({ ItemCodeId: item.Id, WarehouseId: ws.WarehouseId, QtyOnHand: ws.QtyOnHand });
        }
      });
    });

    // Step 6: Split quantity berdasarkan stok dealer-warehouse (priority urutan warehouseDealerIds)
    let totalCollected = 0;
    const assignment: { ItemCodeId: number, WarehouseId: number, QtyAssigned: number }[] = [];
    for (const whId of warehouseDealerIds) {
      // Cari semua ItemCode dengan stok di warehouse ini
      for (const item of validItemCodes) {
        const stock = item.WarehouseStocks.find(ws => ws.WarehouseId === whId)?.QtyOnHand || 0;
        if (stock > 0 && totalCollected < Quantity) {
          const needed = Quantity - totalCollected;
          const assignQty = Math.min(stock, needed);
          assignment.push({ ItemCodeId: item.Id, WarehouseId: whId, QtyAssigned: assignQty });
          totalCollected += assignQty;
          if (totalCollected >= Quantity) break;
        }
      }
      if (totalCollected >= Quantity) break;
    }

    // Step 7: Jika stok di dealer-warehouse kurang, baru ambil dari warehouse lain (stok terbanyak)
    if (totalCollected < Quantity) {
      // Cari warehouse di luar dealer (stok terbanyak dulu)
      const otherWarehouseEntries: { ItemCodeId: number, WarehouseId: number, QtyOnHand: number }[] = [];
      validItemCodes.forEach(item => {
        item.WarehouseStocks.forEach(ws => {
          if (!warehouseDealerIds.includes(ws.WarehouseId) && ws.QtyOnHand > 0) {
            otherWarehouseEntries.push({ ItemCodeId: item.Id, WarehouseId: ws.WarehouseId, QtyOnHand: ws.QtyOnHand });
          }
        });
      });
      // Urutkan berdasarkan stok terbanyak (descending)
      otherWarehouseEntries.sort((a, b) => b.QtyOnHand - a.QtyOnHand);

      for (const entry of otherWarehouseEntries) {
        if (totalCollected >= Quantity) break;
        const needed = Quantity - totalCollected;
        const assignQty = Math.min(entry.QtyOnHand, needed);
        assignment.push({ ...entry, QtyAssigned: assignQty });
        totalCollected += assignQty;
      }
    }

    if (totalCollected < Quantity) {
      res.status(400).json({
        message: "Stok tidak cukup baik di dealer-warehouse maupun warehouse lain.",
        detail: { Needed: Quantity, Collected: totalCollected, Breakdown: assignment }
      });
      return;
    }

    // Step 8: Pilih salah satu itemcode saja untuk cart (paling banyak supply di satu warehouse, sisanya abaikan, atau split ke banyak cartitem jika perlu, sesuaikan rulesmu)
    // Di sini saya asumsikan satu ItemCodeId dan satu WarehouseId saja untuk CartItem (karena field-nya hanya ItemCodeId, tidak ada WarehouseId)
    // Jika ingin support multi-warehouse per cartitem → perlu redesign CartItem + Frontend.

    // Pilih ItemCodeId dengan QtyAssigned terbanyak
    assignment.sort((a, b) => b.QtyAssigned - a.QtyAssigned);
    const best = assignment[0];

    // Validasi MinOrder dan Step
    const bestItem = validItemCodes.find(ic => ic.Id === best.ItemCodeId)!;
    if (bestItem.MinOrderQuantity && Quantity < bestItem.MinOrderQuantity) {
      res.status(400).json({ message: `Minimum order quantity is ${bestItem.MinOrderQuantity}` });
      return;
    }
    if (bestItem.OrderStep && Quantity % bestItem.OrderStep !== 0) {
      res.status(400).json({ message: `Quantity must be multiples of ${bestItem.OrderStep}` });
      return;
    }

    // Lanjutkan proses add/update ke cart seperti biasa
    let cart = await prisma.cart.findUnique({
      where: { UserId: Number(UserId) },
      include: { CartItems: { include: { ItemCode: true } } }
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          UserId: Number(UserId),
          CartItems: { create: [{ ItemCodeId: best.ItemCodeId, Quantity }] }
        },
        include: { CartItems: { include: { ItemCode: true } } }
      });
      res.status(201).json({
        message: "Cart created and item added.",
        FinalItemCodeId: best.ItemCodeId,
        WarehouseBreakdown: assignment,
        data: cart
      });
      return;
    }

    // Update cart item
    const existingExact = cart.CartItems.find(ci => ci.ItemCodeId === best.ItemCodeId);
    if (existingExact) {
      const newQty = mode === "increment" ? existingExact.Quantity + Quantity : Quantity;
      if (newQty <= 0) {
        await prisma.cartItem.delete({ where: { Id: existingExact.Id } });
        const remainingItems = await prisma.cartItem.findMany({ where: { CartId: cart.Id } });
        if (remainingItems.length === 0) {
          await prisma.cart.delete({ where: { Id: cart.Id } });
          res.status(200).json({ message: "Cart emptied because all items removed." });
        } else {
          res.status(200).json({ message: "Item removed from cart." });
        }
        return;
      }
      await prisma.cartItem.update({
        where: { Id: existingExact.Id },
        data: { Quantity: newQty }
      });
      res.status(200).json({
        message: "Cart updated.",
        FinalItemCodeId: best.ItemCodeId,
        WarehouseBreakdown: assignment
      });
      return;
    }

     
     // Hapus CartItem lain pada partnumber selain yang terpilih
    for (const ci of cart.CartItems) {
      if (ci.ItemCode.PartNumberId === partNumberId && ci.ItemCodeId !== best.ItemCodeId) {
        await prisma.cartItem.delete({ where: { Id: ci.Id } });
      }
    }

    // Tambah ke cart
    await prisma.cartItem.create({
      data: { CartId: cart.Id, ItemCodeId: best.ItemCodeId, Quantity }
    });
    res.status(201).json({
      message: "Item added to cart.",
      FinalItemCodeId: best.ItemCodeId,
      WarehouseBreakdown: assignment
    });

  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getOrderRules = async (req: Request, res: Response) => {
  const { ItemCodeId } = req.body;

  if (!ItemCodeId || isNaN(Number(ItemCodeId))) {
    res.status(400).json({ message: "Invalid ItemCodeId" });
    return;
  }

  const item = await prisma.itemCode.findUnique({
    where: { Id: Number(ItemCodeId) },
    include: {
      PartNumber: {
        include: {
          ItemCode: true,
        },
      },
    },
  });

  if (!item) {
    res.status(404).json({ message: "ItemCode not found" });
    return;
  }

  if (item.AllowItemCodeSelection) {
    res.status(200).json({
      AllowSelection: true,
      MinOrderQuantity: item.MinOrderQuantity || 1,
      OrderStep: item.OrderStep || 1,
    });
  } else {
    const fixedItemCodes = item.PartNumber?.ItemCode.filter(i => !i.AllowItemCodeSelection) || [];

    const maxMin = fixedItemCodes.length > 0
      ? Math.max(...fixedItemCodes.map(i => i.MinOrderQuantity || 1))
      : 1;

    const maxStep = fixedItemCodes.length > 0
      ? Math.max(...fixedItemCodes.map(i => i.OrderStep || 1))
      : 1;

    res.status(200).json({
      AllowSelection: false,
      PartNumber: item.PartNumber?.Name,
      MinOrderQuantity: maxMin,
      OrderStep: maxStep,
    });
  }
};

export const getCartByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginUser = req.user;
    const { UserId } = req.body;

    // Verifikasi: harus sama dengan user login!
    if (!loginUser || Number(UserId) !== Number(loginUser.Id)) {
      res.status(403).json({ message: "Access denied. Token tidak sesuai user login." });
      return;
    }

    if (!UserId || isNaN(Number(UserId))) {
      res.status(400).json({ message: "Invalid or missing UserId in request body." });
      return;
    }
    

    const cart = await prisma.cart.findUnique({
      where: { UserId: Number(UserId) },
      include: {
        User: {
          include: {
            Dealer: true
          }
        },
        CartItems: {
          include: {
            ItemCode: {
              include: {
                PartNumber: {
                  select: { Name: true }
                },
                WarehouseStocks: true, // ✅ agar bisa cek total stok
                Price: {
                  where: {
                    DeletedAt: null,
                  },
                  include: {
                    WholesalePrices: {
                      where: { DeletedAt: null }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

   if (!cart) {
      res.status(404).json({ message: "Cart not found for this UserId." });
      return;
    }

    // 🚩 HAPUS CartItem jika ItemCode sudah tidak aktif (DeletedAt ≠ null)
    const invalidCartItemIds = cart.CartItems
      .filter(ci => ci.ItemCode.DeletedAt !== null)
      .map(ci => ci.Id);

    if (invalidCartItemIds.length > 0) {
      // Hapus secara paralel semua CartItem tidak valid
      await prisma.cartItem.deleteMany({
        where: { Id: { in: invalidCartItemIds } }
      });

      // Refresh cart setelah penghapusan, biar clean
      const refreshedCart = await prisma.cart.findUnique({
        where: { UserId: Number(UserId) },
        include: {
          User: { include: { Dealer: true } },
          CartItems: {
            include: {
              ItemCode: {
                include: {
                  PartNumber: { select: { Name: true } },
                  WarehouseStocks: true,
                  Price: { where: { DeletedAt: null }, include: { WholesalePrices: { where: { DeletedAt: null } } } }
                }
              }
            }
          }
        }
      });
      if (!refreshedCart) {
        res.status(404).json({ message: "Cart not found after cleanup." });
        return;
      }
      // lanjut pakai refreshedCart untuk transformCart di bawah (replace 'cart' jadi 'refreshedCart')
      cart.CartItems = refreshedCart.CartItems; // update cart yang lama dengan yang baru (agar bawahnya tidak perlu diubah)
    }

    if (!cart) {
      res.status(404).json({ message: "Cart not found for this UserId." });
      return;
    }

    const transformedCart = {
      Id: cart.Id,
      UserId: cart.UserId,
      CreatedAt: cart.CreatedAt,
      DeletedAt: cart.DeletedAt,
      CartItems: cart.CartItems.map(item => {
        const code = item.ItemCode;
        const allow = code.AllowItemCodeSelection;


        // Ambil harga berdasarkan dealer / price category
        const priceMatch = code.Price.find(p =>
          (p.DealerId === cart.User.DealerId && p.PriceCategoryId === null) ||
          (p.DealerId === null && p.PriceCategoryId === cart.User.Dealer?.PriceCategoryId)
        );

        // Total stok harus dicek agar tidak tampilkan harga jika stok kosong
        const totalStock = code.WarehouseStocks?.reduce((sum, ws) => sum + ws.QtyOnHand, 0) ?? 0;
        const finalPrice = priceMatch?.Price && totalStock > 0 ? priceMatch.Price : 0;


        return {
          Id: item.Id,
          CartId: item.CartId,
          ItemCodeId: item.ItemCodeId,
          Quantity: item.Quantity,
          CreatedAt: item.CreatedAt,
          DeletedAt: item.DeletedAt,
          DisplayName: allow
            ? code.Name
            : code.PartNumber?.Name ?? 'Unnamed PartNumber',
          Price: finalPrice, // ✅ tambahkan ini
          ItemCode: {
            Id: code.Id,
            CreatedAt: code.CreatedAt,
            DeletedAt: code.DeletedAt,
            Weight: code.Weight,
            AllowItemCodeSelection: code.AllowItemCodeSelection,
            MinOrderQuantity: code.MinOrderQuantity,
            QtyPO: code.QtyPO,
            OrderStep: code.OrderStep,
            PartNumberId: code.PartNumberId,
            PartNumber: code.PartNumber,
            ...(allow ? { Name: code.Name } : {})
          }
        };

      })
    };

    res.status(200).json({
      message: "Cart retrieved successfully.",
      data: transformedCart
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};



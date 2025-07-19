import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { CartItem } from "@prisma/client";


const prisma = new PrismaClient();

function resolvePrice(prices: any[], dealerId: any, priceCategoryId: any, quantity: number) {
  // 1. Cek WholesalePrice (aktif, dealer sesuai, range qty cocok)
  for (const p of prices) {
    if (p.DealerId === dealerId && p.WholesalePrices && p.WholesalePrices.length > 0) {
      for (const wp of p.WholesalePrices) {
        if (wp.MinQuantity <= quantity && quantity <= wp.MaxQuantity) {
          return { price: p.Price, source: "wholesale", min: wp.MinQuantity, max: wp.MaxQuantity };
        }
      }
    }
  }
  // 2. Cek Dealer Specific (dealerId ada, priceCategoryId null, tanpa wholesale)
  const dealerSpecific = prices.find(p =>
    p.DealerId === dealerId &&
    p.PriceCategoryId == null &&
    (!p.WholesalePrices || p.WholesalePrices.length === 0)
  );
  if (dealerSpecific) {
    return { price: dealerSpecific.Price, source: "dealer" };
  }
  // 3. Cek PriceCategory (dealerId null, priceCategoryId = dealer punya)
  const byCategory = prices.find(p =>
    p.DealerId == null &&
    p.PriceCategoryId === priceCategoryId
  );
  if (byCategory) {
    return { price: byCategory.Price, source: "category" };
  }
  // Tidak ada harga
  return { price: 0, source: null };
}

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
    // Ambil SEMUA itemcode satu part number untuk cek stok total (AllowItemCodeSelection = false)
    const allItemCodes = await prisma.itemCode.findMany({
      where: {
        PartNumberId: requestItem.PartNumberId,
        AllowItemCodeSelection: false,
        DeletedAt: null
      },
      include: {
        WarehouseStocks: { where: { DeletedAt: null } },
        Price: {                           // ⬅️ TAMBAHKAN INI!
          where: { DeletedAt: null },
          include: { WholesalePrices: { where: { DeletedAt: null } } }
        }
      }
    });

    // Hitung total stok seluruh itemcode (akumulasi dari semua warehouse)
    const totalStockAllWarehouse = allItemCodes.reduce(
      (sum, ic) => sum + ic.WarehouseStocks.reduce((s, ws) => s + ws.QtyOnHand, 0),
      0
    );

    if (Quantity > totalStockAllWarehouse) {
      res.status(400).json({
        message: "Stok total semua warehouse tidak mencukupi untuk permintaan quantity.",
        detail: { Requested: Quantity, Available: totalStockAllWarehouse }
      });
      return;
    }

    // PATCH: Perbolehkan cart asal SALAH SATU itemcode di partnumber punya harga
    let resolved = resolvePrice(requestItem.Price, dealerId, priceCategoryId, Quantity);

    if (resolved.price === 0) {
      // Cek SEMUA itemCode lain dalam partnumber (AllowItemCodeSelection=false saja)
      let fallbackPrice = null;
      let fallbackItem = null;
      for (const ic of allItemCodes) {
        const r = resolvePrice(ic.Price, dealerId, priceCategoryId, Quantity);
        if (r.price > 0) {
          // Simpan harga termurah, kalau ada lebih dari satu
          if (!fallbackPrice || r.price < fallbackPrice.price) {
            fallbackPrice = r;
            fallbackItem = ic;
          }
        }
      }
      if (fallbackPrice && fallbackItem) {
        // GUNAKAN fallback item untuk cart
        requestItem.Id = fallbackItem.Id;
        requestItem.MinOrderQuantity = fallbackItem.MinOrderQuantity;
        requestItem.OrderStep = fallbackItem.OrderStep;
        resolved = fallbackPrice;
        // Lanjut proses seperti biasa di bawah ini
      } else {
        // Benar-benar tidak ada harga valid di seluruh itemCode partnumber tsb
        res.status(400).json({ message: "Tidak ada harga aktif untuk dealer dan quantity ini (semua itemCode pada partnumber)." });
        return;
      }
    }
    if (resolved.source === "wholesale" && (Quantity < resolved.min || Quantity > resolved.max)) {
      res.status(400).json({ message: `Qty harus antara ${resolved.min} dan ${resolved.max} untuk harga grosir.` });
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
        if (
          ci.ItemCode.PartNumberId === requestItem.PartNumberId &&
          ci.ItemCodeId !== requestItem.Id &&
          ci.ItemCode.AllowItemCodeSelection === false
        ) {
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

    // === AKUMULASI breakdown dari semua itemCode & semua warehouse (tanpa filter harga) ===
    let qtyNeeded = Quantity;
    const assignment: { ItemCodeId: number, WarehouseId: number, QtyAssigned: number }[] = [];
    for (const ic of allItemCodes) {
      for (const ws of ic.WarehouseStocks) {
        if (ws.QtyOnHand > 0 && qtyNeeded > 0) {
          const assignQty = Math.min(ws.QtyOnHand, qtyNeeded);
          assignment.push({ ItemCodeId: ic.Id, WarehouseId: ws.WarehouseId, QtyAssigned: assignQty });
          qtyNeeded -= assignQty;
          if (qtyNeeded === 0) break;
        }
      }
      if (qtyNeeded === 0) break;
    }
    if (qtyNeeded > 0) {
      res.status(400).json({
        message: "Stok tidak cukup di semua warehouse (sinkron getOrderRules).",
        detail: { Needed: Quantity, Collected: Quantity - qtyNeeded, Breakdown: assignment }
      });
      return;
    }
    const assignmentWithPrice = assignment.map(asg => {
      // Cari itemCode detail dari allItemCodes
      const itemDetail = allItemCodes.find(ic => ic.Id === asg.ItemCodeId);
      let resolved = null;
      if (itemDetail) {
        resolved = resolvePrice(itemDetail.Price, dealerId, priceCategoryId, asg.QtyAssigned);
      }
      // Kalau resolved.price > 0 artinya ada harga, jika tidak, price = null
      return {
        ...asg,
        Price: (resolved && resolved.price > 0) ? resolved.price : null, // <= set null jika tidak ada harga
        PriceSource: (resolved && resolved.price > 0) ? resolved.source : null,
      };
    });

    // Jika tidak ada satu pun assignment yang punya price, maka seluruh price null
    const anyHasPrice = assignmentWithPrice.some(asg => asg.Price !== null);

    // NOTE: Untuk cart bisa saja masih pakai salah satu saja, tapi waktu generate SalesOrderDetail gunakan assignmentWithPrice sebagai referensi split

    // Untuk Cart: ambil salah satu saja, misal assignmentWithPrice[0], price diisi null/0
    const bestAssignment = assignmentWithPrice[0];

    // === Setelah stok terbukti cukup, baru cek harga valid seperti getOrderRules ===
    const validItemCodes = allItemCodes.filter(item =>
      item.Price.some((p: { DealerId: number | null; PriceCategoryId: number | null; WholesalePrices: string | any[]; }) =>
        (p.DealerId === dealerId && p.PriceCategoryId == null) ||
        (p.DealerId == null && p.PriceCategoryId === priceCategoryId) ||
        (p.WholesalePrices && p.WholesalePrices.length > 0)
      )
    );
    if (validItemCodes.length === 0) {
      res.status(400).json({ message: "Tidak ada item dengan harga aktif untuk dealer ini." });
      return;
    }
    // Pilih item dengan harga termurah
    let chosenItem: any = null;
    let chosenPrice: any = null;
    for (const ic of validItemCodes) {
      const resolved = resolvePrice(ic.Price, dealerId, priceCategoryId, Quantity);
      if (resolved.price > 0) {
        if (!chosenPrice || resolved.price < chosenPrice.price) {
          chosenItem = ic;
          chosenPrice = resolved;
        }
      }
    }
    if (!chosenItem) {
      res.status(400).json({ message: "Tidak ada item dengan harga aktif untuk dealer ini." });
      return;
    }

    // Validasi MinOrder dan Step
    if (chosenItem.MinOrderQuantity && Quantity < chosenItem.MinOrderQuantity) {
      res.status(400).json({ message: `Minimum order quantity is ${chosenItem.MinOrderQuantity}` });
      return;
    }
    if (chosenItem.OrderStep && Quantity % chosenItem.OrderStep !== 0) {
      res.status(400).json({ message: `Quantity must be multiples of ${chosenItem.OrderStep}` });
      return;
    }

    // Step 8: Pilih salah satu itemcode saja untuk cart (paling banyak supply di satu warehouse, sisanya abaikan, atau split ke banyak cartitem jika perlu, sesuaikan rulesmu)
    // Di sini saya asumsikan satu ItemCodeId dan satu WarehouseId saja untuk CartItem (karena field-nya hanya ItemCodeId, tidak ada WarehouseId)
    // Jika ingin support multi-warehouse per cartitem → perlu redesign CartItem + Frontend.

    // Pilih ItemCodeId dengan QtyAssigned terbanyak
    assignment.sort((a, b) => b.QtyAssigned - a.QtyAssigned);
    const best = assignment[0];

    const bestItem = allItemCodes.find(ic => ic.Id === best.ItemCodeId); // <-- pakai allItemCodes BUKAN validItemCodes!
    if (!bestItem) {
      res.status(400).json({ message: "Tidak ditemukan item pada assignment stok (periksa data stok master)." });
      return;
    }
    // Validasi MinOrder dan Step
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
      if (
        ci.ItemCode.PartNumberId === partNumberId &&
        ci.ItemCodeId !== best.ItemCodeId
      ) {
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
  const { ItemCodeId, Quantity } = req.body;
  const loginUser = req.user;

  // 1. Validasi user & input
  if (!loginUser) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!ItemCodeId || isNaN(Number(ItemCodeId))) {
    res.status(400).json({ message: "Invalid ItemCodeId" });
    return;
  }

  // 2. Ambil data user beserta dealer & price category
  const user = await prisma.user.findUnique({
    where: { Id: Number(loginUser.Id) },
    include: { Dealer: { include: { PriceCategory: true } } }
  });
  if (!user || !user.Dealer) {
    res.status(400).json({ message: "User is not associated with a dealer." });
    return;
  }
  const dealerId = user.Dealer.Id;
  const priceCategoryId = user.Dealer.PriceCategoryId;

  // === Tambah di sini ===
  const activeTax = await prisma.tax.findFirst({
    where: {
      IsActive: true,
      DeletedAt: null,
    },
  });

  // 3. Ambil detail item beserta semua kombinasi harga & stok
  const item = await prisma.itemCode.findUnique({
    where: { Id: Number(ItemCodeId) },
    include: {
      PartNumber: {
        include: {
          ItemCode: {
            include: {
              Price: { where: { DeletedAt: null }, include: { WholesalePrices: { where: { DeletedAt: null } } } },
              WarehouseStocks: { where: { DeletedAt: null } },
            }
          },
        },
      },
      Price: { where: { DeletedAt: null }, include: { WholesalePrices: { where: { DeletedAt: null } } } },
      WarehouseStocks: { where: { DeletedAt: null } }
    },
  });

  if (!item) {
    res.status(404).json({ message: "ItemCode not found" });
    return;
  }

  // 4. Jika AllowItemCodeSelection: true → rules langsung pakai item ini
  if (item.AllowItemCodeSelection) {
    const resolved = resolvePrice(item.Price, dealerId, priceCategoryId, Quantity ?? 1);
    const totalStock = item.WarehouseStocks.reduce((sum, ws) => sum + ws.QtyOnHand, 0);

    // 🚩 Tambahan filter stok global:
    if ((Quantity ?? 1) > totalStock) {
      res.status(400).json({
        AllowSelection: true,
        Message: "Total stock every warehouse not enough.",
        TotalStock: totalStock,
        PriceValid: false,
        StockValid: false,
        MinOrderQuantity: item.MinOrderQuantity || 1,
        OrderStep: item.OrderStep ?? null,
        Price: null,
        PriceSource: null,
        MinQtyWholesale: null,
        MaxQtyWholesale: null,
        ActiveTax: activeTax,
      });
      return;
    }

    // Cari wholesale info
    let minWholesale = null, maxWholesale = null;
    const priceObj = item.Price.find(p =>
      p.DealerId === dealerId && p.WholesalePrices && p.WholesalePrices.length > 0
    );
    if (priceObj && priceObj.WholesalePrices.length > 0) {
      // Cari range min max dari semua range wholesale yg aktif
      const range = priceObj.WholesalePrices.reduce((acc, wp) => {
        if (acc.min === null || wp.MinQuantity < acc.min) acc.min = wp.MinQuantity;
        if (acc.max === null || wp.MaxQuantity > acc.max) acc.max = wp.MaxQuantity;
        return acc;
      }, { min: null as null | number, max: null as null | number });
      minWholesale = range.min;
      maxWholesale = range.max;
    }

    res.status(200).json({
      AllowSelection: true,
      MinOrderQuantity: item.MinOrderQuantity || 1,
      OrderStep: item.OrderStep ?? null,
      TotalStock: totalStock,
      Price: resolved.price,
      PriceSource: resolved.source,
      MinQtyWholesale: minWholesale,
      MaxQtyWholesale: maxWholesale,
      PriceValid: resolved.price > 0,
      StockValid: totalStock >= (Quantity ?? 1),
      ActiveTax: activeTax,
      Message:
        resolved.price === 0
          ? "Tidak ada harga aktif untuk dealer dan quantity ini."
          : totalStock < (Quantity ?? 1)
            ? "Stok tidak cukup untuk ItemCode yang dipilih."
            : "OK",
    });
    return;
  }

  // 5. Jika AllowItemCodeSelection: false → rules pakai item lain di partnumber
  const itemCodes = item.PartNumber?.ItemCode.filter(i => !i.AllowItemCodeSelection) || [];
  // ----> Tambah ini dulu <---- //
  const totalStockAll = itemCodes.reduce(
    (sum, ic) => sum + ic.WarehouseStocks.reduce((s, ws) => s + ws.QtyOnHand, 0),
    0
  );

  let warehouseGroup: { [warehouseId: number]: number } = {};
  for (const ic of itemCodes) {
    for (const ws of ic.WarehouseStocks) {
      if (ws.QtyOnHand > 0) {
        warehouseGroup[ws.WarehouseId] = (warehouseGroup[ws.WarehouseId] || 0) + ws.QtyOnHand;
      }
    }
  }
  const stockBreakdown = Object.entries(warehouseGroup).map(([WarehouseId, QtyOnHand]) => ({
    WarehouseId: Number(WarehouseId),
    QtyOnHand
  }));
  // ----> Sampai sini <---- //

  // Lanjut ke pemilihan chosenItem dsb...
  let chosenItem: any = null;
  let chosenPrice: any = null;
  let chosenStock = 0;

  // Cari item dengan harga valid (yang terendah) dan punya stok di warehouse mana pun
  for (const ic of itemCodes) {
    const resolved = resolvePrice(ic.Price, dealerId, priceCategoryId, Quantity ?? 1);
    const stok = ic.WarehouseStocks.reduce((sum, ws) => sum + ws.QtyOnHand, 0);
    if (resolved.price > 0 && stok > 0) {
      if (!chosenPrice || resolved.price < chosenPrice.price) {
        chosenItem = ic;
        chosenPrice = resolved;
        chosenStock = stok;
      }
    }
  }

  // Jika tidak ada item yang harga valid, return error lama
  if (!chosenItem) {
    const itemWithValidPrice = itemCodes.find(ic => {
      const resolved = resolvePrice(ic.Price, dealerId, priceCategoryId, Quantity ?? 1);
      return resolved.price > 0;
    });

    if (itemWithValidPrice) {
      // Ada item harga valid, tapi stok tidak cukup
      const totalStock = itemWithValidPrice.WarehouseStocks.reduce((sum, ws) => sum + ws.QtyOnHand, 0);
      res.status(400).json({
        AllowSelection: false,
        Message: "Stock not enough.",
        MinOrderQuantity: itemWithValidPrice.MinOrderQuantity || null,
        OrderStep: itemWithValidPrice.OrderStep || null,
        Price: null,
        PriceSource: null,
        MinQtyWholesale: null,
        MaxQtyWholesale: null,
        TotalStock: totalStock,
        PriceValid: true,
        StockValid: false,
        ActiveTax: activeTax,
      });
      return;
    }

    // Tidak ada harga valid sama sekali
    res.status(400).json({
      AllowSelection: false,
      Message: "No price data, can't buy.",
      MinOrderQuantity: null,
      OrderStep: null,
      Price: null,
      PriceSource: null,
      MinQtyWholesale: null,
      MaxQtyWholesale: null,
      TotalStock: null,
      PriceValid: false,
      StockValid: false,
      ActiveTax: activeTax,
    });
    return;
  }

  // --- Untuk yang stok cukup dan ada harga valid ---
  let minWholesale = null, maxWholesale = null;
  const priceObj = chosenItem.Price.find((p: { DealerId: number; WholesalePrices: string | any[]; }) =>
    p.DealerId === dealerId && p.WholesalePrices && p.WholesalePrices.length > 0
  );
  if (priceObj && priceObj.WholesalePrices.length > 0) {
    // Cari range min max dari semua range wholesale yg aktif
    const range = priceObj.WholesalePrices.reduce((acc: { min: number | null; max: number | null; }, wp: { MinQuantity: number; MaxQuantity: number; }) => {
      if (acc.min === null || wp.MinQuantity < acc.min) acc.min = wp.MinQuantity;
      if (acc.max === null || wp.MaxQuantity > acc.max) acc.max = wp.MaxQuantity;
      return acc;
    }, { min: null as null | number, max: null as null | number });
    minWholesale = range.min;
    maxWholesale = range.max;
  }

  // Jika sampai di sini, berarti stok cukup dan harga valid
  res.status(200).json({
    AllowSelection: false,
    PartNumber: item.PartNumber?.Name,
    MinOrderQuantity: chosenItem.MinOrderQuantity || 1,
    OrderStep: chosenItem.OrderStep ?? null,
    TotalStock: totalStockAll,
    StockBreakdown: stockBreakdown, // <- semua warehouse semua itemCode!
    Price: chosenPrice.price,
    PriceSource: chosenPrice.source,
    MinQtyWholesale: minWholesale,
    MaxQtyWholesale: maxWholesale,
    PriceValid: chosenPrice.price > 0,
    StockValid: totalStockAll >= (Quantity ?? 1),
    ActiveTax: activeTax,
    Message: totalStockAll >= (Quantity ?? 1)
      ? "OK, stok cukup (termasuk dari warehouse lain jika dibutuhkan)"
      : "Stock not enough.",
  });
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

    // GROUPING & DEDUPLICATION LOGIC (HANYA DI LEVEL RESPONSE, TIDAK MENGUBAH DATABASE)

// Build map {PartNumberId: [CartItems]}
const grouped: { [partNumberId: number]: any[] } = {};
const uniqueItems: { [itemCodeId: number]: boolean } = {};
const filteredCartItems: typeof cart.CartItems = [];

for (const item of cart.CartItems) {
  const code = item.ItemCode;
  // Deduplicate ItemCodeId (hanya satu per ItemCodeId)
  if (uniqueItems[code.Id]) continue;
  uniqueItems[code.Id] = true;

  if (!code.PartNumberId) {
    filteredCartItems.push(item);
    continue;
  }
  // Group per PartNumberId
  if (!grouped[code.PartNumberId]) grouped[code.PartNumberId] = [];
  grouped[code.PartNumberId].push(item);
}

// Now, for each group, allow:
//  - Semua AllowItemCodeSelection:true bebas coexist
//  - HANYA SATU AllowItemCodeSelection:false per partnumber (ambil satu random/pertama)
for (const partNumberId in grouped) {
  const group = grouped[partNumberId];
  // Pisahkan yang AllowItemCodeSelection:true & false
  const allowTrue = group.filter(i => i.ItemCode.AllowItemCodeSelection);
  const allowFalse = group.filter(i => !i.ItemCode.AllowItemCodeSelection);

  // Masukkan semua AllowItemCodeSelection:true
  filteredCartItems.push(...allowTrue);
  // Masukkan HANYA SATU AllowItemCodeSelection:false
  if (allowFalse.length > 0) filteredCartItems.push(allowFalse[0]);
}

    const transformedCart = {
      Id: cart.Id,
      UserId: cart.UserId,
      CreatedAt: cart.CreatedAt,
      DeletedAt: cart.DeletedAt,
      CartItems: await Promise.all(filteredCartItems.map(async item => {
        const code = item.ItemCode;
        const allow = code.AllowItemCodeSelection;

        let resolved = resolvePrice(
          code.Price,
          cart.User.DealerId,
          cart.User.Dealer?.PriceCategoryId,
          item.Quantity
        );

        let totalStock = code.WarehouseStocks?.reduce((sum, ws) => sum + ws.QtyOnHand, 0) ?? 0;
        let finalPrice = (resolved.price && totalStock > 0) ? resolved.price : 0;
        let priceSource = resolved.source;
        let minWholesale = resolved.min;
        let maxWholesale = resolved.max;

        // ---- PATCH: Jika tidak ada harga, ambil harga tertinggi dari semua ItemCode dalam partnumber yang sama ----
        if ((!resolved.price || resolved.price === 0) && code.PartNumberId && !allow) {
          // Query semua itemcode pada partnumber yg sama (allow selection false saja)
          const partItemCodes = await prisma.itemCode.findMany({
            where: {
              PartNumberId: code.PartNumberId,
              AllowItemCodeSelection: false,
              DeletedAt: null
            },
            include: {
              Price: {
                where: { DeletedAt: null },
                include: { WholesalePrices: { where: { DeletedAt: null } } }
              }
            }
          });

          // Dari semua itemcode tsb, cek harga yg valid, ambil TERTINGGI
          let maxResolved: { price: number, source: string | null, min?: number, max?: number } = { price: 0, source: null };
          for (const ic of partItemCodes) {
            // Pakai quantity item di cart
            const r = resolvePrice(ic.Price, cart.User.DealerId, cart.User.Dealer?.PriceCategoryId, item.Quantity);
            if (r.price > maxResolved.price) {
              maxResolved = r;
            }
          }
          if (maxResolved.price > 0) {
            finalPrice = maxResolved.price;
            priceSource = maxResolved.source;
            minWholesale = maxResolved.min;
            maxWholesale = maxResolved.max;
          }
        }
        // ---- END PATCH ----

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
          Price: finalPrice,
          PriceSource: priceSource,
          MinQtyWholesale: minWholesale,
          MaxQtyWholesale: maxWholesale,
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
      }))
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



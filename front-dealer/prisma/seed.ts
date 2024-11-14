import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Reset data and IDs
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "UserCategory" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "ProductCategory" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Event" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "StockHistory" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "PriceHistory" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`);

  console.log("Data and IDs reset successfully.");

  // Load data from db.json
  const dataPath = path.join(__dirname, 'db.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Seed Parent ProductCategory data without hierarchy references
  const categoryMap: { [key: number]: any } = {};
  for (const category of data.ProductCategory) {
    if (!category.parentCategoryId) {
      const createdCategory = await prisma.productCategory.create({
        data: {
          name: category.name,
          createdAt: new Date(category.createdAt),
          deletedAt: category.deletedAt ? new Date(category.deletedAt) : null,
        },
      });
      categoryMap[category.id] = createdCategory;
    }
  }

  // Seed Subcategory data with parentCategoryId references
  for (const category of data.ProductCategory) {
    if (category.parentCategoryId) {
      const createdCategory = await prisma.productCategory.create({
        data: {
          name: category.name,
          createdAt: new Date(category.createdAt),
          deletedAt: category.deletedAt ? new Date(category.deletedAt) : null,
          parentCategoryId: categoryMap[category.parentCategoryId].id,
        },
      });
      categoryMap[category.id] = createdCategory;
    }
  }

  // Seed Product data
  for (const product of data.Product) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        createdAt: new Date(product.createdAt),
        deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
        stock: product.stock,
        images: {
          create: product.images.map((image: any) => ({
            image: image.image,
            createdAt: new Date(image.createdAt),
            deletedAt: image.deletedAt ? new Date(image.deletedAt) : null
          }))
        },
        categories: {
          connect: product.categories.map((cat: any) => ({ id: categoryMap[cat.id].id }))
        },
        prices: {
          create: product.prices.map((price: any) => ({
            price: price.price,
            createdAt: new Date(price.createdAt),
            deletedAt: price.deletedAt ? new Date(price.deletedAt) : null
          }))
        }
      }
    });

    // Seed StockHistory for the product
    await prisma.stockHistory.create({
      data: {
        productId: createdProduct.id,
        stock: product.stock,
        updatedAt: new Date() // Use current date for stock update
      }
    });

    // Seed PriceHistory for the product
    for (const price of product.prices) {
      await prisma.priceHistory.create({
        data: {
          productId: createdProduct.id,
          price: price.price,
          updatedAt: new Date(price.createdAt)
        }
      });
    }
  }


  // Seed UserCategory data
  for (const userCategory of data.UserCategory) {
    await prisma.userCategory.create({
      data: {
        name: userCategory.name,
        createdAt: new Date(userCategory.createdAt),
        deletedAt: userCategory.deletedAt ? new Date(userCategory.deletedAt) : null,
      },
    });
  }

  // Seed User and related data
  for (const user of data.User) {
    await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        name: user.name,
        password: user.password,
        birthdate: new Date(user.birthdate),
        phonenumber: user.phonenumber,
        country: user.country,
        province: user.province,
        address: user.address,
        gender: user.gender,
        image: user.image,
        token: user.token,
        categoryId: user.categoryId,
        createdAt: new Date(user.createdAt),
        deletedAt: user.deletedAt ? new Date(user.deletedAt) : null,
        cart: {
          create: user.cart
            ? {
                createdAt: new Date(user.cart.createdAt),
                deletedAt: user.cart.deletedAt ? new Date(user.cart.deletedAt) : null,
              }
            : undefined,
        },
        orders: {
          create: user.orders.map((order: any) => ({
            orderNumber: order.orderNumber,
            totalPrice: order.totalPrice,
            status: order.status,
            transactionToken: order.transactionToken,
            createdAt: new Date(order.createdAt),
            deletedAt: order.deletedAt ? new Date(order.deletedAt) : null,
          })),
        },
        promos: {
          connectOrCreate: user.promos.map((promo: any) => ({
            where: { code: promo.code },
            create: {
              code: promo.code,
              discount: promo.discount,
              startDate: new Date(promo.startDate),
              endDate: new Date(promo.endDate),
              createdAt: new Date(promo.createdAt),
              deletedAt: promo.deletedAt ? new Date(promo.deletedAt) : null,
            },
          })),
        },
      },
    });
  }

  // Seed Event data
  for (const event of data.Event) {
    await prisma.event.create({
      data: {
        name: event.name,
        description: event.description,
        dateStart: new Date(event.dateStart),
        dateEnd: event.dateEnd ? new Date(event.dateEnd) : null,
        createdAt: new Date(event.createdAt),
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
        images: {
          createMany: {
            data: event.images.map((image: any) => ({
              image: image.image,
              createdAt: new Date(image.createdAt),
              deletedAt: image.deletedAt ? new Date(image.deletedAt) : null,
            })),
          },
        },
      },
    });
  }

  // Seed CartItem data
  for (const cartItem of data.CartItem) {
    await prisma.cartItem.create({
      data: {
        cartId: cartItem.cartId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        createdAt: new Date(cartItem.createdAt),
        deletedAt: cartItem.deletedAt ? new Date(cartItem.deletedAt) : null,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

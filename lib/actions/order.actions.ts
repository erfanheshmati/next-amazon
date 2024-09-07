"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { redirect } from "next/navigation";
import { insertOrderSchema } from "../validator";
import db from "@/db/drizzle";
import { carts, orderItems, orders, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect";
import { formatError } from "../utils";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PaymentResult } from "@/types";

// GET
export async function getOrderById(orderId: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      orderItems: true,
      user: { columns: { name: true, email: true } },
    },
  });
}

// CREATE
export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");
    const cart = await getMyCart();
    const user = await getUserById(session?.user.id!);
    if (!cart || cart.items.length === 0) redirect("/cart");
    if (!user.address) redirect("/shipping-address");
    if (!user.paymentMethod) redirect("/payment-method");

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });
    const insertedOrderId = await db.transaction(async (tx) => {
      const insertedOrder = await tx.insert(orders).values(order).returning();
      for (const item of cart.items) {
        await tx.insert(orderItems).values({
          ...item,
          price: item.price.toFixed(2),
          orderId: insertedOrder[0].id,
        });
      }
      await db
        .update(carts)
        .set({
          items: [],
          totalPrice: "0",
          shippingPrice: "0",
          taxPrice: "0",
          itemsPrice: "0",
        })
        .where(eq(carts.id, cart.id));
      return insertedOrder[0].id;
    });
    if (!insertedOrderId) throw new Error("Order not created");
    redirect(`/order/${insertedOrderId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

// UPDATE
export async function createPayPalOrder(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
      await db
        .update(orders)
        .set({
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0",
          },
        })
        .where(eq(orders.id, orderId));
      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in paypal payment");
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) => {
  const order = await db.query.orders.findFirst({
    columns: { isPaid: true },
    where: eq(orders.id, orderId),
    with: { orderItems: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");
  await db.transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.qty}`,
        })
        .where(eq(products.id, item.productId));
    }
    await tx
      .update(orders)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      })
      .where(eq(orders.id, orderId));
  });
};

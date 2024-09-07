import { CartItem, ShippingAddress } from "@/types";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  json,
} from "drizzle-orm/pg-core";

import { primaryKey } from "drizzle-orm/pg-core/primary-keys";
import { AdapterAccountType } from "next-auth/adapters";

// USERS
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  address: json("address").$type<ShippingAddress>(),
  paymentMethod: text("paymentMethod"),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// PRODUCTS
export const products = pgTable(
  "product",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    images: text("images").array().notNull(),
    brand: text("brand").notNull(),
    description: text("description").notNull(),
    stock: integer("stock").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
    rating: numeric("rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    numReviews: integer("numReviews").notNull().default(0),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    banner: text("banner"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      productSlugIdx: uniqueIndex("product_slug_idx").on(table.slug),
    };
  }
);

// CARTS
export const carts = pgTable("cart", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => users.id, {
    onDelete: "cascade",
  }),
  sessionCartId: text("sessionCartId").notNull(),
  items: json("items").$type<CartItem[]>().notNull().default([]),
  itemsPrice: numeric("itemsPrice", { precision: 12, scale: 2 }).notNull(),
  shippingPrice: numeric("shippingPrice", {
    precision: 12,
    scale: 2,
  }).notNull(),
  taxPrice: numeric("taxPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

import { neon } from "@neondatabase/serverless";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { accounts, categories, transactions } from "@/db/schema";
import { convertAmountToMilliunits } from "@/lib/utils";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = "user_2VPhZc6HOVfme0BoEZhij2btyA9";
const SEED_CATEGORIES = [
  { id: "category_1", name: "Food", userId: SEED_USER_ID },
  { id: "category_2", name: "Rent", userId: SEED_USER_ID },
  { id: "category_3", name: "Utilities", userId: SEED_USER_ID },
  { id: "category_4", name: "Clothing", userId: SEED_USER_ID },
  { id: "category_5", name: "Entertainment", userId: SEED_USER_ID },
  { id: "category_6", name: "Transportation", userId: SEED_USER_ID },
  { id: "category_7", name: "Healthcare", userId: SEED_USER_ID },
  { id: "category_8", name: "Groceries", userId: SEED_USER_ID },
  { id: "category_9", name: "Insurance", userId: SEED_USER_ID },
  { id: "category_10", name: "Education", userId: SEED_USER_ID },
  { id: "category_11", name: "Travel", userId: SEED_USER_ID },
  { id: "category_12", name: "Savings", userId: SEED_USER_ID },
  { id: "category_13", name: "Gifts", userId: SEED_USER_ID },
  { id: "category_14", name: "Subscriptions", userId: SEED_USER_ID },
  { id: "category_15", name: "Miscellaneous", userId: SEED_USER_ID },
];

const SEED_ACCOUNTS = [
  { id: "account_1", name: "Checking", userId: SEED_USER_ID },
  { id: "account_2", name: "Savings", userId: SEED_USER_ID },
];

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 30);

const SEED_TRANSACTIONS: (typeof transactions.$inferSelect)[] = [];

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
  switch (category.name) {
    case "Rent":
      return Math.random() * 400 + 90;
    case "Utilities":
      return Math.random() * 200 + 50;
    case "Food":
      return Math.random() * 30 + 10;
    case "Transportation":
    case "Healthcare":
      return Math.random() * 50 + 15;
    case "Entertainment":
    case "Clothing":
    case "Miscellaneous":
      return Math.random() * 100 + 20;
    case "Groceries":
      return Math.random() * 50 + 20;
    case "Insurance":
    case "Savings":
    case "Subscriptions":
      return Math.random() * 100 + 50;
    case "Education":
      return Math.random() * 150 + 50;
    case "Travel":
    case "Gifts":
      return Math.random() * 300 + 50;
    default:
      return Math.random() * 50 + 10;
  }
};

const generateTransactionPerDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1; // 1 to 4 transactions per day

  for (let i = 0; i < numTransactions; i++) {
    const category =
      SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];
    const isExpense = Math.random() > 0.6; // 60% chance of being an expense
    const amount = generateRandomAmount(category);
    const formattedAmount = convertAmountToMilliunits(
      isExpense ? -amount : amount
    ); // negative for expenses

    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, "yyyy-MM-dd")}_${i}`,
      accountId: SEED_ACCOUNTS[0].id, // using first account
      categoryId: category.id,
      date: day,
      amount: formattedAmount,
      payee: "Merchant",
      notes: "Random transaction",
    });
  }
};

const generateTransactions = () => {
  const days = eachDayOfInterval({
    start: defaultFrom,
    end: defaultTo,
  });

  days.forEach((day) => generateTransactionPerDay(day));
};

generateTransactions();

const main = async () => {
  try {
    // reset database
    await db.delete(transactions).execute();
    await db.delete(accounts).execute();
    await db.delete(categories).execute();

    // seed categories
    await db.insert(categories).values(SEED_CATEGORIES).execute();
    // seed accounts
    await db.insert(accounts).values(SEED_ACCOUNTS).execute();
    // seed transactions
    await db.insert(transactions).values(SEED_TRANSACTIONS).execute();
  } catch (error: unknown) {
    console.error("Error during seed: ", error);
    process.exit(1);
  }
};

main();

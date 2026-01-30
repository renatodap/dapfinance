import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { id: "housing", name: "Housing", type: "expense", color: "#8B5CF6", icon: "home" },
    { id: "transportation", name: "Transportation", type: "expense", color: "#3B82F6", icon: "car" },
    { id: "food_dining", name: "Food & Dining", type: "expense", color: "#F59E0B", icon: "utensils" },
    { id: "groceries", name: "Groceries", type: "expense", color: "#10B981", icon: "shopping-cart" },
    { id: "utilities", name: "Utilities", type: "expense", color: "#6366F1", icon: "zap" },
    { id: "healthcare", name: "Healthcare", type: "expense", color: "#EF4444", icon: "heart" },
    { id: "entertainment", name: "Entertainment", type: "expense", color: "#EC4899", icon: "film" },
    { id: "shopping", name: "Shopping", type: "expense", color: "#F97316", icon: "shopping-bag" },
    { id: "travel", name: "Travel", type: "expense", color: "#14B8A6", icon: "plane" },
    { id: "education", name: "Education", type: "expense", color: "#8B5CF6", icon: "book" },
    { id: "personal_care", name: "Personal Care", type: "expense", color: "#F472B6", icon: "smile" },
    { id: "subscription", name: "Subscriptions", type: "expense", color: "#A855F7", icon: "repeat" },
    { id: "fees", name: "Fees & Charges", type: "expense", color: "#78716C", icon: "alert-circle" },
    { id: "income", name: "Income", type: "income", color: "#22C55E", icon: "dollar-sign" },
    { id: "transfer", name: "Transfer", type: "transfer", color: "#94A3B8", icon: "arrow-right-left" },
    { id: "investment", name: "Investment", type: "transfer", color: "#D4A853", icon: "trending-up" },
    { id: "other", name: "Other", type: "expense", color: "#64748B", icon: "more-horizontal" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  // Seed accounts
  const accounts = [
    { name: "Bank of America Checking", type: "checking", currency: "USD", institution: "Bank of America" },
    { name: "Bank of America Savings", type: "savings", currency: "USD", institution: "Bank of America" },
    { name: "Fidelity Brokerage", type: "investment", currency: "USD", institution: "Fidelity" },
    { name: "Wise USD", type: "checking", currency: "USD", institution: "Wise" },
    { name: "Wise BRL", type: "checking", currency: "BRL", institution: "Wise" },
  ];

  for (const acct of accounts) {
    const existing = await prisma.account.findFirst({ where: { name: acct.name } });
    if (!existing) {
      await prisma.account.create({ data: acct });
    }
  }
  console.log(`Seeded ${accounts.length} accounts`);

  // Seed subscriptions
  const subscriptions = [
    { name: "Netflix", amount: 22.99, billingDay: 15, category: "entertainment" },
    { name: "Spotify", amount: 10.99, billingDay: 1, category: "entertainment" },
    { name: "iCloud+", amount: 2.99, billingDay: 5, category: "subscription" },
    { name: "ChatGPT Plus", amount: 20.0, billingDay: 10, category: "subscription" },
    { name: "GitHub Copilot", amount: 10.0, billingDay: 20, category: "subscription" },
    { name: "Claude Pro", amount: 20.0, billingDay: 12, category: "subscription" },
  ];

  for (const sub of subscriptions) {
    const existing = await prisma.subscription.findFirst({ where: { name: sub.name } });
    if (!existing) {
      await prisma.subscription.create({ data: sub });
    }
  }
  console.log(`Seeded ${subscriptions.length} subscriptions`);

  // Seed goals
  const goals = [
    { name: "Emergency Fund", targetAmount: 15000, currentAmount: 8500 },
    { name: "Vacation 2026", targetAmount: 5000, currentAmount: 1200, targetDate: new Date("2026-06-01") },
    { name: "New Laptop", targetAmount: 3000, currentAmount: 900, targetDate: new Date("2026-03-01") },
  ];

  for (const goal of goals) {
    const existing = await prisma.goal.findFirst({ where: { name: goal.name } });
    if (!existing) {
      await prisma.goal.create({ data: goal });
    }
  }
  console.log(`Seeded ${goals.length} goals`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { trpcError } from "../../trpc/core";


export const createPlan = async (planData: { name: string; description?: string; price: number; duration: number }) => {
  const [plan] = await db
    .insert(schema.plans)
    .values({
      name: planData.name,
      description: planData.description,
      price: planData.price,
      duration: planData.duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();
  if (!plan) {
    throw new trpcError({
      code: "BAD_REQUEST",
      message: "Plan not created",
    });
  }
  return plan;
};

export const getPlan = async (id: number) => {
  const [plan] = await db
    .select()
    .from(schema.plans)
    .where(eq(schema.plans.id, id));
  if (!plan) {
    throw new trpcError({
      code: "NOT_FOUND",
      message: "Plan not found",
    });
  }
  return plan;
};

export const updatePlan = async (id: number, planData: { name?: string; description?: string; price?: number; duration?: number }) => {
  const [plan] = await db
    .update(schema.plans)
    .set({
      ...planData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.plans.id, id))
    .returning();
  if (!plan) {
    throw new trpcError({
      code: "BAD_REQUEST",
      message: "Plan not updated",
    });
  }
  return plan;
};

export const calculateProratedPrice = async (currentPlanId: number, newPlanId: number, daysRemaining: number) => {
  const currentPlan = await getPlan(currentPlanId);
  const newPlan = await getPlan(newPlanId);
  const dailyRate = currentPlan.price / currentPlan.duration;
  const unusedAmount = dailyRate * daysRemaining;
  const upgradePrice = newPlan.price - unusedAmount;
  return upgradePrice;
};
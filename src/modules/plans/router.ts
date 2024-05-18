import { router, trpcError, protectedProcedure, publicProcedure } from "../../trpc/core";
import { z } from "zod";
import { schema, db } from "../../db/client";
import { createPlan, getPlan, updatePlan, calculateProratedPrice } from './model';
import { eq } from "drizzle-orm";

export const plans = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
      duration: z.number(),
    }))
    .mutation(async ({ input }) => {
      const plan = await createPlan(input);
      return plan;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const plan = await updatePlan(id, updateData);
      return plan;
    }),

  getOne: publicProcedure
    .input(z.object({
      planId: z.number(),
    }))
    .query(async ({ input }) => {
      const plan = await getPlan(input.planId);
      return plan;
    }),

  calculateProratedPrice: publicProcedure
    .input(z.object({
      currentPlanId: z.number(),
      newPlanId: z.number(),
      daysRemaining: z.number(),
    }))
    .mutation(async ({ input }) => {
      const price = await calculateProratedPrice(input.currentPlanId, input.newPlanId, input.daysRemaining);
      return { price };
    }),
});
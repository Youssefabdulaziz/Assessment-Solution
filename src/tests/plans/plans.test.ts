import { beforeAll, describe, expect, it } from "vitest";
import { db, schema } from "../../db/client";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import resetDb from "../helpers/resetDb";
import { eq } from "drizzle-orm";

import { plans } from "../../db/schema/";


describe("plan routes", async () => {
  beforeAll(async () => {
    await resetDb();
  });

  describe("create plan", async () => {
    it("should create a new plan", async () => {
      const caller = createAuthenticatedCaller({ isAdmin: true });
      const planData = {
        name: "Basic Plan",
        description: "A basic plan",
        price: 100,
        duration: 30,
      };
      const newPlan = await caller.plans.create(planData);
      expect(newPlan.name).toBe(planData.name);
      expect(newPlan.description).toBe(planData.description);
      expect(newPlan.price).toBe(planData.price);
      expect(newPlan.duration).toBe(planData.duration);
    });
  });

  describe("get plan", async () => {
    it("should get a plan by id", async () => {
      const caller = createAuthenticatedCaller({ isAdmin: true });
      const planData = {
        name: "Basic Plan",
        description: "A basic plan",
        price: 100,
        duration: 30,
      };
      const newPlan = await caller.plans.create(planData);

      const fetchedPlan = await createCaller().plans.getOne({ planId: newPlan.id });
      expect(fetchedPlan.name).toBe(planData.name);
      expect(fetchedPlan.description).toBe(planData.description);
      expect(fetchedPlan.price).toBe(planData.price);
      expect(fetchedPlan.duration).toBe(planData.duration);
    });
  });

  describe("update plan", async () => {
    it("should update an existing plan", async () => {
      const caller = createAuthenticatedCaller({ isAdmin: true });
      const planData = {
        name: "Basic Plan",
        description: "A basic plan",
        price: 100,
        duration: 30,
      };
      const newPlan = await caller.plans.create(planData);

      const updatedData = {
        id: newPlan.id,
        name: "Updated Plan",
        price: 150,
      };
      const updatedPlan = await caller.plans.update(updatedData);
      expect(updatedPlan.name).toBe(updatedData.name);
      expect(updatedPlan.price).toBe(updatedData.price);
    });
  });

  describe("calculate prorated price", async () => {
    it("should calculate prorated upgrade price", async () => {
      const caller = createAuthenticatedCaller({ isAdmin: true });
      const basicPlanData = {
        name: "Basic Plan",
        description: "A basic plan",
        price: 100,
        duration: 30,
      };
      const premiumPlanData = {
        name: "Premium Plan",
        description: "A premium plan",
        price: 200,
        duration: 30,
      };
      const basicPlan = await caller.plans.create(basicPlanData);
      const premiumPlan = await caller.plans.create(premiumPlanData);

      const response = await createCaller().plans.calculateProratedPrice({
        currentPlanId: basicPlan.id,
        newPlanId: premiumPlan.id,
        daysRemaining: 15,
      });
      expect(response.price).toBe(100); // Assuming halfway through the month, user pays the difference for the remaining days
    });
  });
});
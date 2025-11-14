import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const models = await ctx.db
      .query("models")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return Promise.all(
      models.map(async (model) => ({
        ...model,
        fileUrl: await ctx.storage.getUrl(model.fileId),
      }))
    );
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    fileId: v.id("_storage"),
    fileType: v.string(),
    fileSize: v.number(),
    position: v.optional(v.array(v.number())),
    rotation: v.optional(v.array(v.number())),
    scale: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("models", {
      name: args.name,
      projectId: args.projectId,
      userId,
      fileId: args.fileId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      position: args.position || [0, 0, 0],
      rotation: args.rotation || [0, 0, 0],
      scale: args.scale || [1, 1, 1],
      visible: true,
    });
  },
});

export const update = mutation({
  args: {
    modelId: v.id("models"),
    name: v.optional(v.string()),
    position: v.optional(v.array(v.number())),
    rotation: v.optional(v.array(v.number())),
    scale: v.optional(v.array(v.number())),
    visible: v.optional(v.boolean()),
    materials: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const model = await ctx.db.get(args.modelId);
    if (!model || model.userId !== userId) {
      throw new Error("Model not found or access denied");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.position !== undefined) updates.position = args.position;
    if (args.rotation !== undefined) updates.rotation = args.rotation;
    if (args.scale !== undefined) updates.scale = args.scale;
    if (args.visible !== undefined) updates.visible = args.visible;
    if (args.materials !== undefined) updates.materials = args.materials;

    await ctx.db.patch(args.modelId, updates);
  },
});

export const remove = mutation({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const model = await ctx.db.get(args.modelId);
    if (!model || model.userId !== userId) {
      throw new Error("Model not found or access denied");
    }

    await ctx.db.delete(args.modelId);
  },
});

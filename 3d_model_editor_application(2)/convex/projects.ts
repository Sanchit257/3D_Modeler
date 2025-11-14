import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        thumbnailUrl: project.thumbnail
          ? await ctx.storage.getUrl(project.thumbnail)
          : null,
      }))
    );
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Check if user has access
    if (project.userId !== userId) {
      const collaboration = await ctx.db
        .query("collaborators")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      
      if (!collaboration && !project.isPublic) return null;
    }

    return {
      ...project,
      thumbnailUrl: project.thumbnail
        ? await ctx.storage.getUrl(project.thumbnail)
        : null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const defaultScene = {
      camera: { position: [5, 5, 5], target: [0, 0, 0] },
      lighting: { intensity: 1, color: "#ffffff" },
      environment: "studio",
      grid: { visible: true, size: 10 },
    };

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      userId,
      sceneData: JSON.stringify(defaultScene),
      lastModified: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sceneData: v.optional(v.string()),
    thumbnail: v.optional(v.id("_storage")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const updates: any = { lastModified: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.sceneData !== undefined) updates.sceneData = args.sceneData;
    if (args.thumbnail !== undefined) updates.thumbnail = args.thumbnail;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.projectId, updates);
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    // Delete associated models and materials
    const models = await ctx.db
      .query("models")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const materials = await ctx.db
      .query("materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const model of models) {
      await ctx.db.delete(model._id);
    }

    for (const material of materials) {
      await ctx.db.delete(material._id);
    }

    await ctx.db.delete(args.projectId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    sceneData: v.string(), // JSON string of scene configuration
    thumbnail: v.optional(v.id("_storage")),
    isPublic: v.optional(v.boolean()),
    lastModified: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"])
    .searchIndex("search_projects", {
      searchField: "name",
      filterFields: ["userId", "isPublic"],
    }),

  models: defineTable({
    name: v.string(),
    projectId: v.id("projects"),
    userId: v.id("users"),
    fileId: v.id("_storage"),
    fileType: v.string(), // "gltf", "glb", "obj", "fbx"
    fileSize: v.number(),
    position: v.array(v.number()), // [x, y, z]
    rotation: v.array(v.number()), // [x, y, z]
    scale: v.array(v.number()), // [x, y, z]
    visible: v.boolean(),
    materials: v.optional(v.string()), // JSON string of material overrides
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  materials: defineTable({
    name: v.string(),
    projectId: v.id("projects"),
    userId: v.id("users"),
    materialData: v.string(), // JSON string of PBR material properties
    textureIds: v.optional(v.record(v.string(), v.id("_storage"))), // texture type -> storage id
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  collaborators: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    invitedBy: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

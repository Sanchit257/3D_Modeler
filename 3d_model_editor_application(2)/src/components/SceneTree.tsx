import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Model {
  _id: Id<"models">;
  name: string;
  visible: boolean;
  fileType: string;
  fileSize: number;
}

interface SceneTreeProps {
  models: Model[];
  selectedModelId: Id<"models"> | null;
  onSelectModel: (modelId: Id<"models">) => void;
  onToggleMaterialEditor: () => void;
}

export function SceneTree({ 
  models, 
  selectedModelId, 
  onSelectModel, 
  onToggleMaterialEditor 
}: SceneTreeProps) {
  const updateModel = useMutation(api.models.update);
  const deleteModel = useMutation(api.models.remove);
  
  const [editingId, setEditingId] = useState<Id<"models"> | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleToggleVisibility = async (modelId: Id<"models">, currentVisibility: boolean) => {
    try {
      await updateModel({
        modelId,
        visible: !currentVisibility,
      });
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleStartRename = (model: Model) => {
    setEditingId(model._id);
    setEditingName(model.name);
  };

  const handleFinishRename = async () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateModel({
        modelId: editingId,
        name: editingName.trim(),
      });
      setEditingId(null);
      toast.success("Model renamed successfully");
    } catch (error) {
      toast.error("Failed to rename model");
    }
  };

  const handleDeleteModel = async (modelId: Id<"models">, modelName: string) => {
    if (!confirm(`Delete "${modelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteModel({ modelId });
      toast.success("Model deleted successfully");
    } catch (error) {
      toast.error("Failed to delete model");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'gltf':
      case 'glb':
        return '🎯';
      case 'obj':
        return '📦';
      case 'fbx':
        return '🎨';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Scene Tree</h3>
        <div className="text-sm text-white/60">
          {models.length} {models.length === 1 ? 'object' : 'objects'}
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {models.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <div className="text-3xl mb-2">📁</div>
            <p>No models in scene</p>
            <p className="text-xs mt-1">Import a 3D file to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {models.map((model) => (
              <motion.div
                key={model._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedModelId === model._id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => onSelectModel(model._id)}
              >
                <div className="flex items-center gap-3">
                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(model._id, model.visible);
                    }}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    {model.visible ? '👁️' : '🙈'}
                  </button>

                  {/* File Icon */}
                  <span className="text-lg">{getFileIcon(model.fileType)}</span>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    {editingId === model._id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <div className="text-white font-medium text-sm truncate">
                          {model.name}
                        </div>
                        <div className="text-white/50 text-xs">
                          {model.fileType.toUpperCase()} • {formatFileSize(model.fileSize)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(model);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectModel(model._id);
                        onToggleMaterialEditor();
                      }}
                      className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                      title="Edit Materials"
                    >
                      🎨
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModel(model._id, model.name);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedModelId === model._id && (
                  <motion.div
                    layoutId="selection"
                    className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {models.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onToggleMaterialEditor}
            className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm font-medium"
          >
            🎨 Material Editor
          </button>
        </div>
      )}
    </div>
  );
}

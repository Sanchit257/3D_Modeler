import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Model {
  _id: Id<"models">;
  name: string;
  materials?: string;
}

interface MaterialEditorProps {
  model: Model;
  onClose: () => void;
}

interface MaterialProperties {
  baseColor: string;
  metallic: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  normalScale: number;
}

export function MaterialEditor({ model, onClose }: MaterialEditorProps) {
  const updateModel = useMutation(api.models.update);

  // Parse existing materials or use defaults
  const [materials, setMaterials] = useState<MaterialProperties>(() => {
    if (model.materials) {
      try {
        return JSON.parse(model.materials);
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    return {
      baseColor: "#ffffff",
      metallic: 0,
      roughness: 0.5,
      emissive: "#000000",
      emissiveIntensity: 0,
      opacity: 1,
      normalScale: 1,
    };
  });

  const [isApplying, setIsApplying] = useState(false);

  const handlePropertyChange = (property: keyof MaterialProperties, value: number | string) => {
    setMaterials(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleApplyMaterials = async () => {
    setIsApplying(true);
    try {
      await updateModel({
        modelId: model._id,
        materials: JSON.stringify(materials),
      });
      toast.success("Materials applied successfully!");
    } catch (error) {
      toast.error("Failed to apply materials");
    } finally {
      setIsApplying(false);
    }
  };

  const handleResetMaterials = () => {
    setMaterials({
      baseColor: "#ffffff",
      metallic: 0,
      roughness: 0.5,
      emissive: "#000000",
      emissiveIntensity: 0,
      opacity: 1,
      normalScale: 1,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Material Editor</h3>
          <p className="text-sm text-white/60">{model.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Material Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Base Color */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Base Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={materials.baseColor}
              onChange={(e) => handlePropertyChange('baseColor', e.target.value)}
              className="w-12 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={materials.baseColor}
              onChange={(e) => handlePropertyChange('baseColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Metallic */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Metallic: {materials.metallic.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={materials.metallic}
            onChange={(e) => handlePropertyChange('metallic', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Roughness */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Roughness: {materials.roughness.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={materials.roughness}
            onChange={(e) => handlePropertyChange('roughness', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Emissive */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Emissive Color
          </label>
          <div className="flex gap-3 items-center mb-3">
            <input
              type="color"
              value={materials.emissive}
              onChange={(e) => handlePropertyChange('emissive', e.target.value)}
              className="w-12 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={materials.emissive}
              onChange={(e) => handlePropertyChange('emissive', e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Emissive Intensity: {materials.emissiveIntensity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={materials.emissiveIntensity}
            onChange={(e) => handlePropertyChange('emissiveIntensity', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Opacity: {materials.opacity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={materials.opacity}
            onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Normal Scale */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Normal Scale: {materials.normalScale.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={materials.normalScale}
            onChange={(e) => handlePropertyChange('normalScale', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Material Preview */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-3">Preview</h4>
          <div 
            className="w-full h-20 rounded-lg border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${materials.baseColor}, ${materials.emissive})`,
              opacity: materials.opacity,
            }}
          />
          <div className="mt-2 text-xs text-white/60 space-y-1">
            <div>Metallic: {(materials.metallic * 100).toFixed(0)}%</div>
            <div>Roughness: {(materials.roughness * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={handleApplyMaterials}
          disabled={isApplying}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? "Applying..." : "Apply Materials"}
        </button>
        
        <button
          onClick={handleResetMaterials}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

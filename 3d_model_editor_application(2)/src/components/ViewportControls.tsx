import { motion } from "framer-motion";

interface ViewportControlsProps {
  onToggleSceneTree: () => void;
  onToggleMaterialEditor: () => void;
  showSceneTree: boolean;
  showMaterialEditor: boolean;
}

export function ViewportControls({
  onToggleSceneTree,
  onToggleMaterialEditor,
  showSceneTree,
  showMaterialEditor,
}: ViewportControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      {/* Scene Tree Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleSceneTree}
        className={`p-3 rounded-lg backdrop-blur-xl border transition-all duration-200 ${
          showSceneTree
            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
            : 'bg-white/10 border-white/20 text-white/60 hover:text-white hover:bg-white/20'
        }`}
        title="Toggle Scene Tree"
      >
        🌳
      </motion.button>

      {/* Material Editor Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleMaterialEditor}
        className={`p-3 rounded-lg backdrop-blur-xl border transition-all duration-200 ${
          showMaterialEditor
            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
            : 'bg-white/10 border-white/20 text-white/60 hover:text-white hover:bg-white/20'
        }`}
        title="Toggle Material Editor"
      >
        🎨
      </motion.button>

      {/* Camera Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-2">
        <div className="text-xs text-white/60 text-center mb-2">Camera</div>
        <div className="grid grid-cols-3 gap-1">
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ↖️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ⬆️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ↗️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ⬅️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            🎯
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ➡️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ↙️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ⬇️
          </button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white text-xs">
            ↘️
          </button>
        </div>
      </div>
    </div>
  );
}

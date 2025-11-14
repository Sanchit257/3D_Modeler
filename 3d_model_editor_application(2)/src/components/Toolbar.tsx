import { motion } from "framer-motion";

interface Project {
  _id: string;
  name: string;
  lastModified: number;
}

interface ToolbarProps {
  project: Project;
  onSave: () => void;
  onImport: () => void;
  isUploading: boolean;
}

export function Toolbar({ project, onSave, onImport, isUploading }: ToolbarProps) {
  return (
    <div className="h-14 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      {/* Left Section - Project Info */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
        <div className="text-sm text-white/60">
          Last saved: {new Date(project.lastModified).toLocaleTimeString()}
        </div>
      </div>

      {/* Center Section - Tools */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onImport}
          disabled={isUploading}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
              Uploading...
            </>
          ) : (
            <>
              📁 Import Model
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          💾 Save
        </motion.button>
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-white/60">
          Keyboard: W/E/R (Move/Rotate/Scale) • F (Frame) • Ctrl+Z/Y (Undo/Redo)
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SceneTree } from "./SceneTree";
import { MaterialEditor } from "./MaterialEditor";
import { Toolbar } from "./Toolbar";
import { ViewportControls } from "./ViewportControls";
import { ModelViewer } from "./ModelViewer";

interface ModelEditorProps {
  projectId: Id<"projects">;
  onBack: () => void;
}

export function ModelEditor({ projectId, onBack }: ModelEditorProps) {
  const project = useQuery(api.projects.get, { projectId });
  const models = useQuery(api.models.list, { projectId }) || [];
  const updateProject = useMutation(api.projects.update);
  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const addModel = useMutation(api.models.add);

  const [selectedModelId, setSelectedModelId] = useState<Id<"models"> | null>(null);
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);
  const [showSceneTree, setShowSceneTree] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([5, 5, 5]);
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    const file = files[0];
    const supportedTypes = ['.gltf', '.glb', '.obj', '.fbx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!supportedTypes.includes(fileExtension)) {
      toast.error('Unsupported file type. Please use GLTF, GLB, OBJ, or FBX files.');
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await result.json();

      // Add model to project
      await addModel({
        projectId,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        fileId: storageId,
        fileType: fileExtension.slice(1), // Remove dot
        fileSize: file.size,
      });

      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [projectId, generateUploadUrl, addModel]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const selectedModel = models.find(m => m._id === selectedModelId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Top Toolbar */}
      <Toolbar 
        project={project}
        onSave={() => {
          // Auto-save functionality
          updateProject({
            projectId,
            sceneData: JSON.stringify({
              camera: { position: cameraPosition, target: cameraTarget },
              models: models.map(m => ({
                id: m._id,
                position: m.position,
                rotation: m.rotation,
                scale: m.scale,
                visible: m.visible,
              })),
            }),
          });
          toast.success('Project saved!');
        }}
        onImport={() => fileInputRef.current?.click()}
        isUploading={isUploading}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar - Scene Tree */}
        <AnimatePresence>
          {showSceneTree && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col"
            >
              <SceneTree
                models={models}
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModelId}
                onToggleMaterialEditor={() => setShowMaterialEditor(!showMaterialEditor)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Viewport */}
        <div 
          className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 50 }}
            className="w-full h-full"
          >
            <PerspectiveCamera makeDefault position={[5, 5, 5]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              target={[0, 0, 0]}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />

            {/* Environment */}
            <Environment preset="studio" />
            
            {/* Grid */}
            <Grid 
              args={[20, 20]} 
              cellSize={1} 
              cellThickness={0.5} 
              cellColor="#ffffff" 
              sectionSize={5} 
              sectionThickness={1} 
              sectionColor="#8b5cf6" 
              fadeDistance={25} 
              fadeStrength={1} 
              infiniteGrid 
            />

            {/* Models */}
            {models.map((model) => (
              <ModelViewer
                key={model._id}
                model={model}
                isSelected={selectedModelId === model._id}
                onSelect={() => setSelectedModelId(model._id)}
              />
            ))}
          </Canvas>

          {/* Viewport Controls */}
          <ViewportControls
            onToggleSceneTree={() => setShowSceneTree(!showSceneTree)}
            onToggleMaterialEditor={() => setShowMaterialEditor(!showMaterialEditor)}
            showSceneTree={showSceneTree}
            showMaterialEditor={showMaterialEditor}
          />

          {/* Drop Zone Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-lg">Drop 3D files here</p>
                <p className="text-sm">Supports GLTF, GLB, OBJ, FBX</p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Uploading model...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Material Editor */}
        <AnimatePresence>
          {showMaterialEditor && selectedModel && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-white/5 backdrop-blur-xl border-l border-white/10"
            >
              <MaterialEditor
                model={selectedModel}
                onClose={() => setShowMaterialEditor(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gltf,.glb,.obj,.fbx"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

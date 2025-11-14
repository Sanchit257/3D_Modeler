import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Mesh, Group } from "three";
import { Id } from "../../convex/_generated/dataModel";

interface Model {
  _id: Id<"models">;
  name: string;
  fileUrl: string | null;
  position: number[];
  rotation: number[];
  scale: number[];
  visible: boolean;
  materials?: string;
}

interface ModelViewerProps {
  model: Model;
  isSelected: boolean;
  onSelect: () => void;
}

export function ModelViewer({ model, isSelected, onSelect }: ModelViewerProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Load GLTF model if URL is available
  const gltf = model.fileUrl && model.fileUrl.includes('.gl') 
    ? useGLTF(model.fileUrl) 
    : null;

  // Animate selection highlight
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (!model.visible || !model.fileUrl) {
    return null;
  }

  // Apply material overrides if they exist
  const applyMaterialOverrides = (object: any) => {
    if (model.materials) {
      try {
        const materialProps = JSON.parse(model.materials);
        object.traverse((child: any) => {
          if (child.isMesh && child.material) {
            // Apply PBR material properties
            if (materialProps.baseColor) {
              child.material.color.set(materialProps.baseColor);
            }
            if (typeof materialProps.metallic === 'number') {
              child.material.metalness = materialProps.metallic;
            }
            if (typeof materialProps.roughness === 'number') {
              child.material.roughness = materialProps.roughness;
            }
            if (materialProps.emissive) {
              child.material.emissive.set(materialProps.emissive);
            }
            if (typeof materialProps.emissiveIntensity === 'number') {
              child.material.emissiveIntensity = materialProps.emissiveIntensity;
            }
            if (typeof materialProps.opacity === 'number') {
              child.material.opacity = materialProps.opacity;
              child.material.transparent = materialProps.opacity < 1;
            }
            child.material.needsUpdate = true;
          }
        });
      } catch (error) {
        console.warn('Failed to parse material overrides:', error);
      }
    }
  };

  return (
    <group
      ref={groupRef}
      position={model.position as [number, number, number]}
      rotation={model.rotation as [number, number, number]}
      scale={model.scale as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {gltf ? (
        <primitive 
          object={gltf.scene.clone()} 
          ref={(ref: any) => {
            if (ref) {
              applyMaterialOverrides(ref);
            }
          }}
        />
      ) : (
        // Fallback cube for non-GLTF files or loading state
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={isSelected ? "#8b5cf6" : hovered ? "#a855f7" : "#6b7280"}
            wireframe={!model.fileUrl}
          />
        </mesh>
      )}

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial 
            color="#8b5cf6" 
            wireframe 
            transparent 
            opacity={0.5} 
          />
        </mesh>
      )}

      {/* Hover highlight */}
      {hovered && !isSelected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial 
            color="#a855f7" 
            wireframe 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      )}
    </group>
  );
}

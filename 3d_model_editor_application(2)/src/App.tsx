import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProjectDashboard } from "./components/ProjectDashboard";
import { ModelEditor } from "./components/ModelEditor";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<Id<"projects"> | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Authenticated>
        <div className="relative min-h-screen">
          {/* Glassmorphism header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 h-16 flex justify-between items-center px-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3D</span>
              </div>
              <h1 className="text-xl font-bold text-white">Model Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              {currentProjectId && (
                <button
                  onClick={() => setCurrentProjectId(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20"
                >
                  ← Dashboard
                </button>
              )}
              <SignOutButton />
            </div>
          </header>

          <main className="pt-16 min-h-screen">
            {currentProjectId ? (
              <ModelEditor 
                projectId={currentProjectId} 
                onBack={() => setCurrentProjectId(null)} 
              />
            ) : (
              <ProjectDashboard onOpenProject={setCurrentProjectId} />
            )}
          </main>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">3D</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Model Studio</h1>
              <p className="text-xl text-white/70">
                Create, edit, and share 3D models in your browser
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}

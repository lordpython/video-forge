import { CustomAuthForm } from "../app/auth/CustomAuthForm";
import { useNavigate } from "react-router-dom";
import { Video } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VideoForge</span>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Welcome to VideoForge</h1>
              <p className="text-gray-400">Sign in to create cinematic videos</p>
            </div>

            <CustomAuthForm signInOptions={{ 
              google: true,
              emailAndPassword: true
            }} />

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Don't have an account? Sign up using the options above.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          © {new Date().getFullYear()} VideoForge. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

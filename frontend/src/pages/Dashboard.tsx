import { useUserGuardContext } from "app";
import { useNavigate } from "react-router-dom";
import { Video, ChevronDown, Bell, User, LogOut, Menu, X, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { StoriesSection } from "components/StoriesSection";

export default function Dashboard() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Check for success message in location state
  useEffect(() => {
    if (location.state?.success && location.state?.message) {
      setNotification({
        message: location.state.message,
        type: 'success'
      });
      
      // Clear notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  // Sample projects for demonstration
  const projects = [
    {
      id: "p1",
      title: "AI Product Demo",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80",
      date: "2 days ago",
      status: "complete"
    },
    {
      id: "p2",
      title: "Company Overview",
      thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80",
      date: "1 week ago",
      status: "complete"
    },
    {
      id: "p3",
      title: "New Project",
      thumbnail: "",
      date: "",
      status: "new"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-4 md:px-6 lg:px-8 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VideoForge</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-300 hover:text-white">
                <span>Projects</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-700 hidden group-hover:block">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">All Projects</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Recently Viewed</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Shared With Me</a>
                </div>
              </div>
            </div>
            <a href="#" className="text-gray-300 hover:text-white">Templates</a>
            <a href="#" className="text-gray-300 hover:text-white">Support</a>
            
            <div className="ml-2 relative group">
              <button className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-800">
                <Bell className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-full">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-700 hidden group-hover:block">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Profile Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Billing</a>
                  <button 
                    onClick={() => navigate('/logout')} 
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 z-20">
            <div className="py-2 px-4">
              <a href="#" className="block py-2 text-gray-300">Projects</a>
              <a href="#" className="block py-2 text-gray-300">Templates</a>
              <a href="#" className="block py-2 text-gray-300">Support</a>
              <div className="pt-2 mt-2 border-t border-gray-800">
                <p className="py-2 text-sm font-medium truncate">{user?.email}</p>
                <a href="#" className="block py-2 text-gray-300">Profile Settings</a>
                <button 
                  onClick={() => navigate('/logout')} 
                  className="w-full text-left py-2 text-red-400 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${notification.type === 'success' ? 'bg-green-900/70 text-green-200 border border-green-700' : 'bg-red-900/70 text-red-200 border border-red-700'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-800' : 'bg-red-800'}`}>
                {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                )}
              </div>
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
            </button>
          </motion.div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user?.displayName || user?.email?.split('@')[0] || 'Creator'}</h1>
            <p className="text-gray-400">Create and manage your video projects</p>
          </div>
          <button 
            onClick={() => navigate('/StoryAcquisition')}
            className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Stories Section */}
        <StoriesSection 
          userId={user.uid} 
          onNotification={(message, type) => setNotification({ message, type })} 
        />

        <div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-800">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-900/30 flex-shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="m7 4 10 8-10 8V4Z"></path></svg>
                </div>
                <div>
                  <h4 className="font-medium">AI Product Demo video completed</h4>
                  <p className="text-sm text-gray-400 mt-1">Your video has been processed and is ready for download</p>
                  <div className="mt-2">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">View Project</button>
                  </div>
                </div>
                <div className="ml-auto text-xs text-gray-500">2 days ago</div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-900/30 flex-shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 7h.01"></path><path d="M17 17h.01"></path><path d="M7 17h.01"></path><path d="M17 7h.01"></path></svg>
                </div>
                <div>
                  <h4 className="font-medium">New template added: Product Launch</h4>
                  <p className="text-sm text-gray-400 mt-1">A new template has been added to the library</p>
                  <div className="mt-2">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Explore Templates</button>
                  </div>
                </div>
                <div className="ml-auto text-xs text-gray-500">5 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

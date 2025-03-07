
// THIS FILE IS AUTOGENERATED WHEN PAGES ARE UPDATED
import { lazy } from "react";
import { RouteObject } from "react-router";


import { UserGuard } from "app";


const App = lazy(() => import("./pages/App.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Logout = lazy(() => import("./pages/Logout.tsx"));
const ScriptGeneration = lazy(() => import("./pages/ScriptGeneration.tsx"));
const StoryAcquisition = lazy(() => import("./pages/StoryAcquisition.tsx"));
const StoryDetails = lazy(() => import("./pages/StoryDetails.tsx"));
const VoiceOver = lazy(() => import("./pages/VoiceOver.tsx"));

export const userRoutes: RouteObject[] = [

	{ path: "/", element: <App />},
	{ path: "/dashboard", element: <UserGuard><Dashboard /></UserGuard>},
	{ path: "/login", element: <Login />},
	{ path: "/logout", element: <UserGuard><Logout /></UserGuard>},
	{ path: "/script-generation", element: <UserGuard><ScriptGeneration /></UserGuard>},
	{ path: "/scriptgeneration", element: <UserGuard><ScriptGeneration /></UserGuard>},
	{ path: "/story-acquisition", element: <UserGuard><StoryAcquisition /></UserGuard>},
	{ path: "/storyacquisition", element: <UserGuard><StoryAcquisition /></UserGuard>},
	{ path: "/story-details", element: <UserGuard><StoryDetails /></UserGuard>},
	{ path: "/storydetails", element: <UserGuard><StoryDetails /></UserGuard>},
	{ path: "/voice-over", element: <UserGuard><VoiceOver /></UserGuard>},
	{ path: "/voiceover", element: <UserGuard><VoiceOver /></UserGuard>},

];

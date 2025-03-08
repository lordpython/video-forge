import os
import pathlib
import json
import dotenv
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

dotenv.load_dotenv()

from databutton_app.mw.auth_mw import AuthConfig, get_authorized_user


def get_router_config() -> dict:
    try:
        # Note: This file is not available to the agent
        cfg = json.loads(open("routers.json").read())
    except:
        return False
    return cfg


def is_auth_disabled(router_config: dict, name: str) -> bool:
    return router_config["routers"][name]["disableAuth"]


def import_api_routers() -> APIRouter:
    """Create top level router including all user defined endpoints."""
    routes = APIRouter(prefix="/routes")

    router_config = get_router_config()

    src_path = pathlib.Path(__file__).parent

    # Import API routers from "src/app/apis/*/__init__.py"
    apis_path = src_path / "app" / "apis"

    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]

    # Ensure video_clips is in the list of API names
    if "video_clips" not in api_names:
        api_names.append("video_clips")

    api_module_prefix = "app.apis."

    for name in api_names:
        print(f"Importing API: {name}")
        try:
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            if isinstance(api_router, APIRouter):
                routes.include_router(
                    api_router,
                    dependencies=(
                        []
                        if is_auth_disabled(router_config, name)
                        else [Depends(get_authorized_user)]
                    ),
                )
        except Exception as e:
            print(e)
            continue

    print(routes.routes)

    return routes


def get_firebase_config() -> dict | None:
    extensions = os.environ.get("DATABUTTON_EXTENSIONS", "[]")
    extensions = json.loads(extensions)

    for ext in extensions:
        if ext["name"] == "firebase-auth":
            return ext["config"]["firebaseConfig"]

    return None


def create_app() -> FastAPI:
    """Create the app. This is called by uvicorn with the factory option to construct the app object."""
    app = FastAPI()
    
    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(import_api_routers())

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                print(f"{method} {route.path}")

    firebase_config = get_firebase_config()

    if firebase_config is None:
        print("No firebase config found")
        app.state.auth_config = None
    else:
        print("Firebase config found")
        auth_config = {
            "jwks_url": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            "audience": firebase_config["projectId"],
            "header": "authorization",
        }

        app.state.auth_config = AuthConfig(**auth_config)

    return app


app = create_app()

# Add a direct test endpoint that doesn't use the router system
from fastapi import Response
import json

@app.get("/test-direct")
async def test_direct():
    """Test endpoint that bypasses the router system"""
    # Get all routes with their authentication status
    router_config = get_router_config()
    
    # Extract route information
    routes_info = []
    for route in app.routes:
        if hasattr(route, "methods"):
            route_info = {
                "path": route.path,
                "name": getattr(route, "name", "unnamed"),
                "methods": list(route.methods)
            }
            
            # Check if this is from our router system
            if route.path.startswith("/routes/"):
                # Extract the API name from the path
                parts = route.path.split("/")
                if len(parts) > 2:
                    api_name = parts[2]
                    # Check if this API has auth disabled
                    try:
                        for name in router_config["routers"]:
                            if api_name.startswith(name):
                                route_info["auth_required"] = not router_config["routers"][name]["disableAuth"]
                                break
                    except:
                        route_info["auth_required"] = "unknown"
                        
            routes_info.append(route_info)
            
    # Get environment information (safely)
    env_info = {
        "DATABUTTON_PROJECT_ID": os.environ.get("DATABUTTON_PROJECT_ID", "not_set"),
        "DATABUTTON_CUSTOM_DOMAIN": os.environ.get("DATABUTTON_CUSTOM_DOMAIN", "not_set"),
        "has_firebase_auth": "firebase-auth" in os.environ.get("DATABUTTON_EXTENSIONS", "[]")
    }
            
    return Response(
        content=json.dumps({
            "status": "success",
            "message": "API test endpoint",
            "time": str(import_api_routers.import_time),
            "server_info": {
                "routes": routes_info,
                "environment": env_info,
                "auth_system": "Firebase Auth" if app.state.auth_config else "None"
            }
        }, indent=2),
        media_type="application/json"
    )

# Add a timestamp to track when routers are imported
import time
import_api_routers.import_time = time.time()

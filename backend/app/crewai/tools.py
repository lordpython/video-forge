"""
CrewAI Tools for Video Forge

This module defines tools that agents can use to perform specific tasks.
"""

from crewai import Tool
from typing import Dict, List, Any, Optional
import requests
import json
import os
import urllib.parse
from pathlib import Path

class PexelsSearchTool(Tool):
    """Tool for searching images and videos on Pexels."""
    
    name: str = "PexelsSearch"
    description: str = "Search for images and videos on Pexels based on keywords"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the PexelsSearchTool.
        
        Args:
            api_key (str, optional): Pexels API key. If not provided, will try to get from environment.
        """
        super().__init__()
        self.api_key = api_key or os.getenv("PEXELS_API_KEY", "")
        if not self.api_key:
            print("Warning: No Pexels API key provided. Tool will return mock data.")
    
    def run(self, query: str, media_type: str = "photos", per_page: int = 5) -> str:
        """
        Search for media on Pexels.
        
        Args:
            query (str): Search query
            media_type (str): Type of media to search for (photos or videos)
            per_page (int): Number of results to return
            
        Returns:
            str: JSON string containing search results
        """
        if not self.api_key:
            # Return mock data if no API key is provided
            return self._get_mock_data(query, media_type, per_page)
        
        if media_type == "photos":
            url = f"https://api.pexels.com/v1/search?query={query}&per_page={per_page}"
        else:
            url = f"https://api.pexels.com/videos/search?query={query}&per_page={per_page}"
        
        headers = {
            "Authorization": self.api_key
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return json.dumps(response.json(), indent=2)
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "message": "Failed to search Pexels. Using mock data instead.",
                "results": self._get_mock_data(query, media_type, per_page)
            }, indent=2)
    
    def _get_mock_data(self, query: str, media_type: str, per_page: int) -> Dict[str, Any]:
        """
        Generate mock data for testing without an API key.
        
        Args:
            query (str): Search query
            media_type (str): Type of media to search for
            per_page (int): Number of results to return
            
        Returns:
            dict: Mock search results
        """
        if media_type == "photos":
            return {
                "total_results": per_page,
                "page": 1,
                "per_page": per_page,
                "photos": [
                    {
                        "id": f"mock_{i}",
                        "width": 1920,
                        "height": 1080,
                        "url": f"https://example.com/mock_photo_{i}.jpg",
                        "photographer": "Mock Photographer",
                        "photographer_url": "https://example.com/photographer",
                        "src": {
                            "original": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg",
                            "large2x": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                            "large": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
                            "medium": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&h=350",
                            "small": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&h=130",
                            "portrait": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
                            "landscape": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
                            "tiny": f"https://images.pexels.com/photos/mock_{i}/pexels-photo-mock_{i}.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280"
                        }
                    }
                    for i in range(per_page)
                ]
            }
        else:
            return {
                "total_results": per_page,
                "page": 1,
                "per_page": per_page,
                "videos": [
                    {
                        "id": f"mock_{i}",
                        "width": 1920,
                        "height": 1080,
                        "url": f"https://example.com/mock_video_{i}.mp4",
                        "image": f"https://images.pexels.com/videos/mock_{i}/free-video-mock_{i}.jpg",
                        "duration": 15,
                        "user": {
                            "id": 12345,
                            "name": "Mock Videographer",
                            "url": "https://example.com/videographer"
                        },
                        "video_files": [
                            {
                                "id": f"file_{i}_1",
                                "quality": "hd",
                                "file_type": "video/mp4",
                                "width": 1920,
                                "height": 1080,
                                "link": f"https://player.vimeo.com/external/mock_{i}.hd.mp4?s=mock_token&profile_id=175"
                            },
                            {
                                "id": f"file_{i}_2",
                                "quality": "sd",
                                "file_type": "video/mp4",
                                "width": 640,
                                "height": 360,
                                "link": f"https://player.vimeo.com/external/mock_{i}.sd.mp4?s=mock_token&profile_id=165"
                            }
                        ]
                    }
                    for i in range(per_page)
                ]
            }

class MediaDownloadTool(Tool):
    """Tool for downloading media files."""
    
    name: str = "MediaDownload"
    description: str = "Download media files from URLs"
    
    def __init__(self, download_dir: Optional[str] = None):
        """
        Initialize the MediaDownloadTool.
        
        Args:
            download_dir (str, optional): Directory to save downloaded files. 
                                         If not provided, will use a default directory.
        """
        super().__init__()
        self.download_dir = download_dir or os.path.join(os.getcwd(), "downloads")
        os.makedirs(self.download_dir, exist_ok=True)
    
    def run(self, url: str, filename: Optional[str] = None) -> str:
        """
        Download a file from a URL.
        
        Args:
            url (str): URL of the file to download
            filename (str, optional): Name to save the file as. If not provided, will extract from URL.
            
        Returns:
            str: Path to the downloaded file or error message
        """
        if not filename:
            filename = url.split("/")[-1]
        
        file_path = os.path.join(self.download_dir, filename)
        
        try:
            # For mock URLs, just create an empty file
            if url.startswith("https://example.com") or url.startswith("https://images.pexels.com/photos/mock"):
                Path(file_path).touch()
                return json.dumps({
                    "success": True,
                    "message": "Created mock file (no actual download)",
                    "file_path": file_path
                }, indent=2)
            
            # For real URLs, download the file
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return json.dumps({
                "success": True,
                "message": "File downloaded successfully",
                "file_path": file_path
            }, indent=2)
            
        except Exception as e:
            # If download fails, create a mock file for testing
            Path(file_path).touch()
            return json.dumps({
                "success": False,
                "error": str(e),
                "message": "Failed to download file. Created mock file instead.",
                "file_path": file_path
            }, indent=2)

class SerperSearchTool(Tool):
    """Tool for searching the web using Serper API."""
    
    name: str = "SerperSearch"
    description: str = "Search the web for information on a topic using Serper API"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the SerperSearchTool.
        
        Args:
            api_key (str, optional): Serper API key. If not provided, will try to get from environment.
        """
        super().__init__()
        self.api_key = api_key or os.getenv("SERPER_API_KEY", "")
        if not self.api_key:
            print("Warning: No Serper API key provided. Tool will return mock data.")
    
    def run(self, query: str, search_type: str = "search", num_results: int = 5) -> str:
        """
        Search the web using Serper API.
        
        Args:
            query (str): Search query
            search_type (str): Type of search (search, images, videos, news, places)
            num_results (int): Number of results to return
            
        Returns:
            str: JSON string containing search results
        """
        if not self.api_key:
            # Return mock data if no API key is provided
            return self._get_mock_data(query, search_type, num_results)
        
        url = "https://google.serper.dev/" + search_type
        
        payload = json.dumps({
            "q": query,
            "num": num_results
        })
        
        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, headers=headers, data=payload)
            response.raise_for_status()
            return json.dumps(response.json(), indent=2)
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "message": "Failed to search with Serper API. Using mock data instead.",
                "results": self._get_mock_data(query, search_type, num_results)
            }, indent=2)
    
    def _get_mock_data(self, query: str, search_type: str, num_results: int) -> Dict[str, Any]:
        """
        Generate mock data for testing without an API key.
        
        Args:
            query (str): Search query
            search_type (str): Type of search
            num_results (int): Number of results to return
            
        Returns:
            dict: Mock search results
        """
        encoded_query = urllib.parse.quote(query)
        
        if search_type == "search":
            return {
                "searchParameters": {
                    "q": query,
                    "gl": "us",
                    "hl": "en",
                    "num": num_results,
                    "type": "search"
                },
                "organic": [
                    {
                        "title": f"Mock Result {i+1} for {query}",
                        "link": f"https://example.com/result-{i+1}-{encoded_query}",
                        "snippet": f"This is a mock search result {i+1} for the query '{query}'. It contains some sample information that might be relevant to the topic.",
                        "position": i+1
                    } for i in range(num_results)
                ],
                "knowledgeGraph": {
                    "title": query,
                    "type": "Mock Knowledge Graph",
                    "description": f"This is a mock knowledge graph description for '{query}'."
                }
            }
        elif search_type == "news":
            return {
                "searchParameters": {
                    "q": query,
                    "gl": "us",
                    "hl": "en",
                    "num": num_results,
                    "type": "news"
                },
                "news": [
                    {
                        "title": f"Mock News {i+1} about {query}",
                        "link": f"https://example.com/news-{i+1}-{encoded_query}",
                        "snippet": f"This is a mock news article {i+1} about '{query}'. It contains some sample information that might be relevant to the topic.",
                        "date": "1 day ago",
                        "source": "Mock News Source"
                    } for i in range(num_results)
                ]
            }
        elif search_type in ["images", "videos"]:
            items_key = "images" if search_type == "images" else "videos"
            return {
                "searchParameters": {
                    "q": query,
                    "gl": "us",
                    "hl": "en",
                    "num": num_results,
                    "type": search_type
                },
                items_key: [
                    {
                        "title": f"Mock {search_type[:-1].capitalize()} {i+1} of {query}",
                        "link": f"https://example.com/{search_type[:-1]}-{i+1}-{encoded_query}",
                        "source": "example.com"
                    } for i in range(num_results)
                ]
            }
        else:
            return {
                "searchParameters": {
                    "q": query,
                    "type": search_type
                },
                "message": f"Mock data for search type '{search_type}' not implemented.",
                "results": []
            }


class FFmpegTool(Tool):
    """Tool for basic FFmpeg operations."""
    
    name: str = "FFmpeg"
    description: str = "Execute FFmpeg commands for video processing"
    
    def run(self, command: str) -> str:
        """
        Execute an FFmpeg command.
        
        Args:
            command (str): FFmpeg command to execute (without the 'ffmpeg' prefix)
            
        Returns:
            str: Command output or error message
        """
        import subprocess
        
        try:
            # Check if FFmpeg is installed
            subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
            
            # Execute the command
            full_command = f"ffmpeg {command}"
            process = subprocess.run(full_command, shell=True, capture_output=True, text=True)
            
            if process.returncode == 0:
                return json.dumps({
                    "success": True,
                    "message": "FFmpeg command executed successfully",
                    "command": full_command,
                    "output": process.stdout
                }, indent=2)
            else:
                return json.dumps({
                    "success": False,
                    "message": "FFmpeg command failed",
                    "command": full_command,
                    "error": process.stderr
                }, indent=2)
                
        except subprocess.CalledProcessError:
            return json.dumps({
                "success": False,
                "message": "FFmpeg is not installed or not in PATH",
                "command": command
            }, indent=2)
        except Exception as e:
            return json.dumps({
                "success": False,
                "message": "Error executing FFmpeg command",
                "command": command,
                "error": str(e)
            }, indent=2)

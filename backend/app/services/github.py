import base64
import httpx
from typing import List, Dict, Any, Optional

class GitHubService:
    @staticmethod
    async def get_user_profile(token: str) -> Dict[str, Any]:
        """Fetch user profile details from GitHub."""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ResumeLegend"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.github.com/user", headers=headers)
            if response.status_code != 200:
                raise Exception(f"Failed to fetch GitHub profile: {response.text}")
            return response.json()

    @staticmethod
    async def get_user_repos(token: str) -> List[Dict[str, Any]]:
        """Fetch repositories owned by the user from GitHub."""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ResumeLegend"
        }
        async with httpx.AsyncClient() as client:
            # Fetch up to 100 repositories owned by the user
            response = await client.get(
                "https://api.github.com/user/repos?type=owner&per_page=100&sort=updated",
                headers=headers
            )
            if response.status_code != 200:
                raise Exception(f"Failed to fetch repositories from GitHub: {response.text}")
            return response.json()

    @staticmethod
    async def get_repo_readme(token: str, owner: str, repo_name: str) -> Optional[str]:
        """Fetch and decode the README of a specific repository."""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ResumeLegend"
        }
        async with httpx.AsyncClient() as client:
            url = f"https://api.github.com/repos/{owner}/{repo_name}/readme"
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                # Many repos might not have a README
                return None
            
            data = response.json()
            content_b64 = data.get("content", "")
            if not content_b64:
                return None
            
            try:
                # Decoded string
                decoded_bytes = base64.b64decode(content_b64.replace("\n", ""))
                return decoded_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                print(f"Error decoding README for {repo_name}: {e}")
                return None

from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.utils.dependencies import get_current_user
import httpx

router = APIRouter(prefix="/integrations", tags=["integrations"])

GITHUB_API = "https://api.github.com"
LEETCODE_GQL = "https://leetcode.com/graphql"

LEETCODE_QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    profile {
      ranking
      starRating
    }
  }
}
"""


@router.get("/github/{username}")
async def github_stats(
    username: str,
    current_user: User = Depends(get_current_user),
):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            profile_resp = await client.get(
                f"{GITHUB_API}/users/{username}",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
            if profile_resp.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
            if profile_resp.status_code != 200:
                raise HTTPException(status_code=502, detail="GitHub API error")

            profile = profile_resp.json()

            repos_resp = await client.get(
                f"{GITHUB_API}/users/{username}/repos?per_page=100&sort=updated",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
            repos = repos_resp.json() if repos_resp.status_code == 200 else []

            lang_counts: dict = {}
            for repo in repos:
                lang = repo.get("language")
                if lang:
                    lang_counts[lang] = lang_counts.get(lang, 0) + 1

            top_languages = sorted(lang_counts.items(), key=lambda x: -x[1])[:5]

            return {
                "username": username,
                "name": profile.get("name"),
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "avatar_url": profile.get("avatar_url"),
                "bio": profile.get("bio"),
                "top_languages": top_languages,
                "repo_count": len(repos),
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Failed to reach GitHub API: {str(e)}")


@router.get("/leetcode/{username}")
async def leetcode_stats(
    username: str,
    current_user: User = Depends(get_current_user),
):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                LEETCODE_GQL,
                json={"query": LEETCODE_QUERY, "variables": {"username": username}},
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                },
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="LeetCode API error")

            data = resp.json().get("data", {}).get("matchedUser")
            if not data:
                raise HTTPException(status_code=404, detail=f"LeetCode user '{username}' not found")

            stats = data.get("submitStats", {}).get("acSubmissionNum", [])
            solved = {s["difficulty"]: s["count"] for s in stats}
            profile = data.get("profile", {})

            return {
                "username": username,
                "solved": solved,
                "ranking": profile.get("ranking"),
                "star_rating": profile.get("starRating"),
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Failed to reach LeetCode API: {str(e)}")

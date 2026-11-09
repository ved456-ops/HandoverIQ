"""
Phase 2 backend test.

Starts uvicorn, calls POST /api/github/analyze with a known public repo,
and asserts the response shape and content.

Run from d:/Handoveriq/backend:
  python tests/test_github_analyze.py
"""
import json
import os
import sys
import time
import subprocess
import urllib.request
import urllib.error

# Force UTF-8 output on Windows
os.environ.setdefault("PYTHONUTF8", "1")
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]

BACKEND_PORT = 8765
TEST_REPO    = "https://github.com/tiangolo/fastapi"


def start_server() -> subprocess.Popen:
    python = sys.executable
    proc = subprocess.Popen(
        [python, "-m", "uvicorn", "app.main:app", "--port", str(BACKEND_PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    for _ in range(30):
        time.sleep(1)
        try:
            urllib.request.urlopen(f"http://localhost:{BACKEND_PORT}/health")
            return proc
        except Exception:
            pass
    proc.kill()
    raise RuntimeError("Server did not start in time")


def call_analyze(repo_url: str) -> dict:
    data = json.dumps({"repository_url": repo_url}).encode()
    req = urllib.request.Request(
        f"http://localhost:{BACKEND_PORT}/api/github/analyze",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body}") from e


def run_tests():
    print("Starting test server...")
    server = start_server()
    try:
        print(f"Calling /api/github/analyze with {TEST_REPO}")
        result = call_analyze(TEST_REPO)

        # Assertions
        assert result["source"] == "github_rest_api_v3", "source field missing"
        assert result["repo"]["full_name"] == "tiangolo/fastapi", "wrong repo"
        assert isinstance(result["commits"], list), "commits not a list"
        assert len(result["commits"]) > 0, "no commits returned"
        assert isinstance(result["pull_requests"], list), "PRs not a list"
        assert isinstance(result["issues"], list), "issues not a list"

        commit = result["commits"][0]
        assert "sha" in commit
        assert "html_url" in commit
        assert "commit" in commit
        assert "message" in commit["commit"]

        activity = result["activity"]
        assert activity["commits_fetched"] > 0
        assert "open_issues" in activity

        print()
        print("PASS: /api/github/analyze returned real data")
        print(f"  Repo        : {result['repo']['full_name']}")
        print(f"  Stars       : {result['repo']['stargazers_count']}")
        print(f"  Language    : {result['repo']['language']}")
        print(f"  Commits     : {activity['commits_fetched']}")
        print(f"  PRs         : {activity['pull_requests_fetched']}  (open={activity['open_pull_requests']})")
        print(f"  Issues      : {activity['issues_fetched']}  (open={activity['open_issues']})")
        msg = commit["commit"]["message"][:60].replace("\n", " ")
        print(f"  First commit: {msg!r}")
        print(f"  Commit URL  : {commit['html_url']}")
        print()

        # Error handling: bad repo
        print("Testing 404 for non-existent repo...")
        try:
            call_analyze("https://github.com/handoveriq-nonexistent/no-such-repo-xyz")
            print("FAIL: Expected 404 but got success")
            sys.exit(1)
        except RuntimeError as e:
            if "404" in str(e):
                print("PASS: 404 returned for non-existent repo")
            else:
                raise

        # Error handling: malformed URL
        print("Testing 422 for malformed URL...")
        try:
            call_analyze("not-a-url-at-all")
            print("FAIL: Expected 422 but got success")
            sys.exit(1)
        except RuntimeError as e:
            if "422" in str(e):
                print("PASS: 422 returned for malformed URL")
            else:
                raise

        print()
        print("All backend tests PASSED")

    finally:
        server.kill()


if __name__ == "__main__":
    run_tests()

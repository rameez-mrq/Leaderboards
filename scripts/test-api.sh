#!/bin/bash

# Test script to submit results to leaderboard API
# Usage: ./scripts/test-api.sh

# Set these variables (or export them as environment variables)
LEADERBOARD_API_URL="${LEADERBOARD_API_URL:-https://your-app.vercel.app}"
LEADERBOARD_API_TOKEN="${LEADERBOARD_API_TOKEN:-your-token-here}"

# Remove trailing slash from URL if present
LEADERBOARD_API_URL="${LEADERBOARD_API_URL%/}"

# Test data
STUDENT_ID="test-team-1"
STUDENT_NAME="Test Student"
TEAM="Test Team"
MAP=0.35
P5=0.28
P20=0.30
NDCG=0.32
REPO="test-org/test-repo"
RUN_ID="test-run-123"
LAST_COMMIT="2025-11-19T16:22:24+05:30"

echo "🧪 Testing leaderboard API submission..."
echo "URL: $LEADERBOARD_API_URL/api/results"
echo ""

# Make the API call
response=$(curl -sSfL -w "\n%{http_code}" -X POST "${LEADERBOARD_API_URL}/api/results" \
  -H "Authorization: Bearer ${LEADERBOARD_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
        --arg student_id "$STUDENT_ID" \
        --arg student_name "$STUDENT_NAME" \
        --arg team "$TEAM" \
        --arg repo "$REPO" \
        --arg run_id "$RUN_ID" \
        --arg last_commit "$LAST_COMMIT" \
        --argjson map "$MAP" \
        --argjson p5 "$P5" \
        --argjson p20 "$P20" \
        --argjson ndcg "$NDCG" \
        '{student_id:$student_id, student_name:$student_name, team:$team, repo:$repo, run_id:$run_id, last_commit:$last_commit, map:$map, p5:$p5, p20:$p20, ndcg:$ndcg}')")

# Extract HTTP status code (last line) and response body (all but last line)
# macOS compatible version
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response: $body"
echo ""

if [ "$http_code" -eq 200 ]; then
  echo "✅ Success! Results submitted to leaderboard."
elif [ "$http_code" -eq 401 ]; then
  echo "❌ Unauthorized - Check your LEADERBOARD_API_TOKEN"
elif [ "$http_code" -eq 404 ]; then
  echo "❌ Not Found - Check your LEADERBOARD_API_URL"
elif [ "$http_code" -eq 400 ]; then
  echo "❌ Bad Request - Check the payload format"
  echo "Response details: $body"
elif [ "$http_code" -eq 308 ] || [ "$http_code" -eq 301 ] || [ "$http_code" -eq 302 ]; then
  echo "❌ Redirect detected - Check URL format (remove trailing slash)"
  echo "Make sure LEADERBOARD_API_URL doesn't end with a slash"
else
  echo "❌ Error - HTTP $http_code"
  echo "Response: $body"
fi


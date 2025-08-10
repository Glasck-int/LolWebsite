#!/bin/bash
echo "Testing debug route for tournament 5167..."
curl -s http://localhost:3000/api/tournaments/id/5167/debug/matches | jq .
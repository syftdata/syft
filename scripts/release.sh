#!/bin/bash
set -e

# get current git branch name
curr_branch=$(git rev-parse --abbrev-ref HEAD)
npx lerna version --no-push
# npx lerna bootstrap

# check if any git changes are present
files=$({ git diff --name-only ; git diff --name-only --staged ; } | sort | uniq)
if [ -n "$files" ]; then
	echo "Changes detected, committing..."
	git add *
	git commit -m "fix package lock file"
fi
git push origin $curr_branch --force

# open pull request with main.
open https://github.com/syftdata/syft/pull/new/$curr_branch

git branch -D release
git push origin :release || true
git checkout -b release
git push origin release

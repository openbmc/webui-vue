#!/bin/bash
# Run GUI Linting and Formatting as part of the CI Build process
#
# This is a short term solution. The long term solution to will be to
# add much of this to the build script.
#

set -e

# When called from openbmc-build-scripts, the `pwd` could be anywhere, but
# the root of the repo is passed in the first argument.  Switch to the repo
# root so npm/git run in the right place.
if [ -n "$1" ]; then
    cd "$1" || exit 1
fi

npm install
npm run lint

# The CI image's Node and npm rewrite package-lock.json when the submitted
# lockfile was produced by different versions. Fail that diff.
if ! git diff --quiet -- package-lock.json; then
    echo "package-lock.json does not match the lockfile produced by Node $(node -p 'process.versions.node') and npm $(npm -v)." >&2
    git --no-pager diff -- package-lock.json
    exit 1
fi
git --no-pager diff --exit-code

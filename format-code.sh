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
    cd "$1"
fi

npm ci
npm run lint
git --no-pager diff --exit-code

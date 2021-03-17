#!/bin/bash
# Run GUI Unit Tests as part of the CI Build process#

set -e

# When called from openbmc-build-scripts, the `pwd` could be anywhere, but
# the root of the repo is passed in the first argument.  Switch to the repo
# root so npm/git run in the right place.
if [ -n "$1" ]; then
    cd "$1"
fi

npm ci
npm run test:unit

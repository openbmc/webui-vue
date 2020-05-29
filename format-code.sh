# Run GUI Linting and Formatting as part of the CI Build process
# of the
#
# This is a short term solution. The long term solution to will be to
# add much of this to the build script.
#
# This must be run on a clean repository to succeed

DIR=$(pwd)
cd ${DIR}

set -e

echo "Formatting code under $DIR/"

npm ci
npm run lint
git --no-pager diff --exit-code
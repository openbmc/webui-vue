#!/usr/bin/env sh
# This is the script to deploy documentation only

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

# push to gh-pages repo
git push -f git@github.com:openbmc/webui-vue.git master:gh-pages
cd -
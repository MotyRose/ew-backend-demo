#!/bin/bash -e
yarn install --production=false
rm -rf dist
yarn build

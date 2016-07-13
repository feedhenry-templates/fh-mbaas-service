#!/bin/bash

NODE_GYP="$(npm list node-gyp | grep node-gyp)"
NODE_PRE_GYP="$(npm list node-pre-gyp | grep node-pre-gyp)"

if ! [ -n "$NODE_PRE_GYP" ]; then
  npm install node-pre-gyp
else
  echo "node-pre-gyp already installed"
fi

if ! [ -n "$NODE_GYP" ]; then
  npm install node-gyp
else
  echo "node-gyp already installed"
fi

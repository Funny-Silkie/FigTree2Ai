#!/bin/bash

readonly BUILD_DIR="build"

cd $(dirname $0)
cd ..

# Transpile to JavaScript
npx tsc

# Edit JS files
cd $BUILD_DIR
for FILE in $(ls *.js); do
    sed -e "s/@ts-ignore//g" -i $FILE
done

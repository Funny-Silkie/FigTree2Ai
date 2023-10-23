#!/bin/bash

readonly VERSION="1.2.0"
readonly BUILD_DIR="build"
readonly TMP_PATH="tmp"

cd $(dirname $0)
cd ..

readonly LICENSE_PATH=$(pwd)/LICENSE.md

# Transpile to JavaScript
npx tsc

# Edit JS files
cd $BUILD_DIR
for FILE in $(ls *.js); do
    echo $FILE
    # remove "@ts-ignore" (causes syntax error)
    sed -e "s/@ts-ignore//g" $FILE > $TMP_PATH
    # print script info
    echo "// ${FILE} in FigTree2Ai" > $FILE
    echo "// Version: ${VERSION}" >> $FILE
    # print license
    while read LINE; do
        echo "// ${LINE}" >> $FILE
    done < $LICENSE_PATH
    cat $TMP_PATH >> $FILE
    rm $TMP_PATH
done

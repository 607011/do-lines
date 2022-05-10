#!/bin/bash

echo -e "\033[31;1mWARNING!\033[0m"
echo "You should use \`grunt\` in order to deploy a minified version of the code."
read  -n 1 -p "Do you really want to deploy via this script? (y/N) " answer
if [[ $answer != y ]]; then
    exit 0
fi

# .env must define the following variables:
# HOST: the SSH target of the host to deploy to, e.g. username@www.example.com
# DEST_DIR: the path to the directory on the host where to copy the files to, e.g. /var/www/html
source .env

DIST=dist
mkdir -p ${DIST}

echo "Collecting ..."
while read filename; do
    echo ${filename}
    dir=$(dirname ${filename})
    mkdir -p ${DIST}/${dir}
    cp ${filename} ${DIST}/${filename}
done <files-to-copy.txt

echo "Synching ..."
rsync -avzr dist/* ${HOST}:${DEST_DIR}

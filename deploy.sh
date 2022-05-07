#!/bin/bash

source .env
exiftool -all= chalkboard-3084w.png
scp index.html default.css bart.js chalkboard-3840w.png GochiHand-Regular.ttf olau@${HOST}:${DEST_DIR}

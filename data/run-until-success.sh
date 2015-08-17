#!/bin/bash
RET=1
until [ ${RET} -eq 0 ]; do
    echo 'Launching job'
    rm songs.json
    node index.js
    RET=$?
    sleep 5
done

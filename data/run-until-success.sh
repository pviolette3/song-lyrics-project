RET=1
until [ ${RET} -eq 0 ]; do
    echo 'Launching job'
    node index.js
    RET=$?
    sleep 5
done

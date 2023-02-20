#!/usr/bin/env bash

exitCodeArray=()

onFailure() {
    exitCodeArray+=( "$?" )
}

trap onFailure ERR

npm run test

addNumbers () {
    local IFS='+'
    printf "%s" "$(( $* ))"
}

trap '' ERR

if (( $(addNumbers "${exitCodeArray[@]}") )); then
    printf 'some of your tests failed\n' >&2
    exit -1
fi

sleep 10

docker stop algolia-sync-db-1
docker stop algolia-sync-app-1
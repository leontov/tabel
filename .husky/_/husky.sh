#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && printf "husky (debug) - %s\n" "$1"
  }
  readonly husky_skip_init=1
  export husky_skip_init
  debug "initializing husky"
fi

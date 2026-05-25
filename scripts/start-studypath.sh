#!/bin/zsh
set -e

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "/Users/macbook/Documents/RU"

exec npm run dev -- --host 127.0.0.1 --port 5173

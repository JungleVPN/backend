#!/bin/sh
# Wraps the postgres entrypoint to ensure POSTGRES_PASSWORD in .env is always
# the active password — even when the data volume already exists.
#
# Postgres only reads POSTGRES_PASSWORD during first init (empty data dir).
# On subsequent starts with an existing volume, the stored password may differ
# from .env (e.g. after a password change). This script fixes that every boot
# by running ALTER USER via the local unix socket, which uses trust auth and
# never requires the old password.
set -e

# Forward SIGTERM/INT to the background postgres process so `docker stop` works
_term() { kill -TERM "$BGPID" 2>/dev/null; }
trap _term TERM INT

# Start postgres normally (handles first-time init automatically)
docker-entrypoint.sh "$@" &
BGPID=$!

# Wait until the local socket is accepting connections (trust auth — no password needed)
until pg_isready -U "$POSTGRES_USER" -q 2>/dev/null; do
    sleep 0.5
done

# Escape any single quotes in the password for safe SQL embedding
SAFE_PASS=$(printf '%s' "$POSTGRES_PASSWORD" | sed "s/'/''/g")

# Sync the password — local socket uses trust auth so this always succeeds
psql -U "$POSTGRES_USER" \
    -c "ALTER USER \"$POSTGRES_USER\" WITH PASSWORD '$SAFE_PASS'" \
    > /dev/null

# Write a sentinel file so the healthcheck knows the sync is complete.
# The migration service only starts after the healthcheck passes,
# guaranteeing the password is correct before any TCP connections are made.
touch /tmp/db-ready

echo "[db] Password synchronized with POSTGRES_PASSWORD"

wait "$BGPID"

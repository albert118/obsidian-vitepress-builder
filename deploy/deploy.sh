#!/bin/bash
# This uses an env var to authenticate with GitHub using a fine grained PAT
# Check here for cronjob help: https://crontab.guru

echo "-- Daedalus Project Docs Wiki Updater --"

GHCR_USERNAME='albertferguson118@gmail.com'
# not secure in the slightest but fuck it
CR_PAT=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
COMPOSE_FILE=/mnt/cache/appdata/daedalus-project-docs/docker-compose.yml
WEBH_URL="https://discord.com/api/webhooks/1027173037172330516/xkwVVyTabb12qaSzj99dtjcSfydTuM05luZrjIrTLwXY0n2KAtMRZDLwWOnIdWfq4akZ"

DRY_RUN=0

if [ $DRY_RUN -eq 1 ]; then
  echo "$(date) | Dry run triggered"

  # attempt to auth with github
  echo $CR_PAT | docker login ghcr.io -u $GHCR_USERNAME --password-stdin

  curl -k -X POST --header 'Content-Type: application/json' -d "{\"content\": \"Hello, world! this is the wiki helper script.\"}" $WEBH_URL 2>&1
else
  echo "$(date) | Checking for new content..."
  
  # auth with github
  echo $CR_PAT | docker login ghcr.io -u $GHCR_USERNAME --password-stdin
  # pull latest (this should be a nightly build)
  # NAMESPACE/IMAGE_NAME should be account/repo-title:latest OR master
  docker pull ghcr.io/albert118/daedalus-project-docs:master

  # Send the notification to Discord that new content was found
  MESSAGE="**Daedalus Project Wiki:** 📃 Deployment has started."
  curl -k -X POST --header 'Content-Type: application/json' -d "{\"content\": \"$MESSAGE\"}" $WEBH_URL 2>&1

  echo "$(date) | Redeployment starting"
  docker compose -f $COMPOSE_FILE up -d

  # Send the notification to Discord that the run was successful
  MESSAGE="**Daedalus Project Wiki:** 🛳️ Deployment finished. Please check the site for the latest."
  curl -k -X POST --header 'Content-Type: application/json' -d "{\"content\": \"$MESSAGE\"}" $WEBH_URL 2>&1
fi

echo "$(date) | Finishing up run. The container should have or is currently restarting."

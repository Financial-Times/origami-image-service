# Origami Service Makefile
# ------------------------
# This section of the Makefile should not be modified, it includes
# commands from the Origami service Makefile.
# https://github.com/Financial-Times/origami-service-makefile
node_modules/%/index.mk: package.json ; npm install $* ; touch $@
-include node_modules/@financial-times/origami-service-makefile/index.mk
# [edit below this line]
# ------------------------


# Configuration
# -------------

INTEGRATION_TIMEOUT = 10000
INTEGRATION_SLOW = 2000

SERVICE_NAME = Origami Image Service
SERVICE_SYSTEM_CODE = origami-image-service-v2
SERVICE_SALESFORCE_ID = Origami Image Service V2

HEROKU_APP_QA = origami-image-service-qa
HEROKU_APP_EU = origami-image-service-eu
HEROKU_APP_US = origami-image-service-us
GRAFANA_DASHBOARD = origami-image-service

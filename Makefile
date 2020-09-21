# Origami Service Makefile
# ------------------------
# This section of the Makefile should not be modified, it includes
# commands from the Origami service Makefile.
# https://github.com/Financial-Times/origami-service-makefile
include node_modules/@financial-times/origami-service-makefile/index.mk
# [edit below this line]
# ------------------------

# Set up the npm binary path
NPM_BIN = ./node_modules/.bin
export PATH := $(PATH):$(NPM_BIN)

# Run the service using nodemon, restarting when
# local files change
run-dev:
	@nodemon --ext html,js,json --exec "npm run dev"

# Run the unit tests using mocha
test-unit:
	mocha "test/unit/**/*.test.js" --recursive --reporter mocha-github-actions-reporter ${CI:+--forbid-only}

# Run the unit tests using mocha and generating
# a coverage report if nyc or istanbul are installed
test-unit-coverage:
	nyc --reporter=text --reporter=html mocha "test/unit/**/*.test.js" -- --recursive --reporter mocha-github-actions-reporter ${CI:+--forbid-only}

# Run the integration tests using mocha
test-integration:
	mocha "test/integration/**/*.test.js" --recursive --reporter mocha-github-actions-reporter ${CI:+--forbid-only} --timeout $(INTEGRATION_TIMEOUT) --slow $(INTEGRATION_SLOW) $(INTEGRATION_FLAGS)


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

export GITHUB_RELEASE_REPO := Financial-Times/origami-image-service

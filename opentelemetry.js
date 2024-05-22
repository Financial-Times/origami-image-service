'use strict';

const {NodeSDK} = require('@opentelemetry/sdk-node');
const {NoopSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const {PeriodicExportingMetricReader} = require('@opentelemetry/sdk-metrics');
const {
	getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
	OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const {Resource} = require('@opentelemetry/resources');

// Instrumentation that is not included by @opentelemetry/auto-instrumentations-node.
const {HostMetrics} = require('@opentelemetry/host-metrics');
const {
	RuntimeNodeInstrumentation,
} = require('@opentelemetry/instrumentation-runtime-node');

// Import the OpenTelemetry Semantic Conventions for use in setting resource attributes.
const {
	SEMRESATTRS_CLOUD_PROVIDER,
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_INSTANCE_ID,
	SEMRESATTRS_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

// Set the resource attributes for this Heroku app.
const resource = new Resource({
	['heroku.app.id']: process.env.HEROKU_APP_ID,
	['heroku.release.commit']: process.env.HEROKU_SLUG_COMMIT,
	['heroku.release.creation_timestamp']: process.env.HEROKU_RELEASE_CREATED_AT,
	[SEMRESATTRS_CLOUD_PROVIDER]: 'heroku',
	[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
	[SEMRESATTRS_SERVICE_INSTANCE_ID]: process.env.HEROKU_DYNO_ID,
	[SEMRESATTRS_SERVICE_VERSION]: process.env.HEROKU_RELEASE_VERSION,
});

// Use an OTLP metric exporter to send metrics to the OpenTelemetry Gateway Collector. Mostly configured using environment variables.
const metricReader = new PeriodicExportingMetricReader({
	exporter: new OTLPMetricExporter({
		headers: {
			'X-OTel-Key': process.env.OTEL_EXPORTER_OTLP_API_KEY || '',
		},
	}),
});

// Configure the OpenTelemetry SDK.
const sdk = new NodeSDK({
	resource,
	metricReader,

	// Do not export traces.
	spanProcessors: [],
	traceExporter: new NoopSpanProcessor(),

	instrumentations: [
		// Enable automatic instrumentation, see https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node.
		getNodeAutoInstrumentations(),

		// Collect Node.js runtime metrics, see https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-runtime-node.
		new RuntimeNodeInstrumentation(),
	],
});

// Start the OpenTelemetry SDK.
sdk.start();

// Collect host metrics from the Heroku dyno, such as CPU and memory usage.
// See https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/opentelemetry-host-metrics.
new HostMetrics({}).start();

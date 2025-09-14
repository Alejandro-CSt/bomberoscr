import env from "@/config/env";
import { metrics } from "@opentelemetry/api";
import * as logsApi from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

const serviceName = env.OTEL_SERVICE_NAME ?? "sync-v2";
const otlpEndpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const metricExporter = new OTLPMetricExporter({
  url: `${otlpEndpoint}/v1/metrics`
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000
});

const traceExporter = new OTLPTraceExporter({
  url: `${otlpEndpoint}/v1/traces`
});

const loggerProvider = new LoggerProvider({
  processors: [new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${otlpEndpoint}/v1/logs` }))]
});
logsApi.logs.setGlobalLoggerProvider(loggerProvider);

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    new WinstonInstrumentation({
      disableLogCorrelation: false,
      disableLogSending: false
    })
  ]
});

sdk.start();

const meterProvider = new MeterProvider({ readers: [metricReader] });

metrics.setGlobalMeterProvider(meterProvider);

const meter = metrics.getMeter(serviceName);

export const metricsRegistry = {
  jobDurationMs: meter.createHistogram("sync_job_duration_ms", {
    description: "Duration of background jobs in milliseconds"
  }),
  incidentsDiscovered: meter.createCounter("incident_discovery_count", {
    description: "Number of incidents discovered per run"
  })
};

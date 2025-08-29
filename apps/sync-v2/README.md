# sync-v2

A sync program that syncs the latest incidents attended by Bomberos de Costa Rica and related reference data from SIGAE into a database. Built with BullMQ queues and workers with scheduled jobs and controlled concurrency.

Rewrite of [sync (v1)](../sync/) that heavily uses `neverthrow` for explicit, predictable error handling, which helps deal with unreliable responses from the SIGAE API.

## What it syncs

The service keeps several entities up to date on a schedule.

| Task | Frequency |
| --- | --- |
| Incident discovery | Every minute (discovers newly opened incidents) |
| Open incident follow-up | Every 3 minutes per incident until it closes* |
| Incident types sync | Twice daily |
| Station sync (per station) | Twice daily (limited concurrency) |
| Vehicle sync (per vehicle) | Twice daily (limited concurrency) |
| Districts/Geo data sync | Twice daily |
| Vehicle disponibility sync | Twice daily |

\* An incident is considered closed/resolved when SIGAE marks it as closed and exact coordinates are available for the incident.

## How it works

- Discovery finds new incidents and enqueues an open-incident job per incident.
- Open incidents are updated and re-queued every few minutes until they are considered closed.
- Scheduled jobs trigger per-item sync where applicable (e.g., stations and vehicles). Each item is enqueued as its own job and processed with limited concurrency to prevent large outbound request spikes.
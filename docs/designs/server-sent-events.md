# Server-Sent Events (SSE) Integration for WebUI-Vue

Author: Jason Westover (Discord: jasonwestover)

Other contributors: None

Created: February 2, 2026

## Problem Description

WebUI-Vue relies on periodic polling for system state changes and event log
updates. This increases latency for critical alerts, consumes bandwidth with
repeated reads, and creates race conditions between user actions and poll
timing. Redfish defines an EventService SSE endpoint that delivers real-time
events to browser clients. This design integrates SSE into WebUI-Vue using
Vue 3 (Pinia, VueQuery and composables) to reduce polling where Redfish
events exist.

Goals:

- Provide real-time event streaming using Redfish EventService SSE
- Establish a reusable SSE infrastructure for multiple views
- Support reconnection with replay using Last-Event-Id
- Migrate affected Vuex stores to Pinia + VueQuery pattern

Non-goals:

- Implement HTTP POST webhook subscriptions
- Modify BMC firmware (bmcweb is the target implementation)
- Replace all polling (resources without events continue polling)

## Background and References

Redfish EventService provides asynchronous event delivery. The SSE endpoint is
`/redfish/v1/EventService/SSE` with `text/event-stream`. bmcweb implements SSE
in the files below and is the implementation target:

- `http/server_sent_event.hpp` and `http/server_sent_event_impl.hpp`
- `redfish-core/lib/eventservice_sse.hpp`
- `redfish-core/include/event_service_manager.hpp`
- `redfish-core/src/subscription.cpp`

Key bmcweb behaviors:

- Subscription limits: 20 total, 10 SSE
- Replay buffer: 200 events in a circular buffer
- Write timeout: 30 seconds
- Buffer limit: 10 MB
- Heartbeat events may be emitted by subscriptions
- Event filtering uses `$filter`

Redfish event payloads use Message registries:

- `redfish-core/include/registries/resource_event_message_registry.hpp`
- `redfish-core/include/registries/sensor_event_message_registry.hpp`
- `redfish-core/include/registries/task_event_message_registry.hpp`
- `redfish-core/include/registries/heartbeat_event_message_registry.hpp`
- `redfish-core/include/registries/openbmc_message_registry.hpp`
- `redfish-core/include/registries/oem/`

References:

- DMTF DSP0266 (Redfish) EventService
- Gerrit 79075 (prior SSE work for MetricReport events)

## Requirements

Users need immediate visibility into event logs and critical state changes.
Developers need a consistent way to consume SSE, map events to UI updates, and
keep authentication and reconnection behavior predictable.

Functional requirements:

1. Connect to `/redfish/v1/EventService/SSE` after authentication
2. Reconnect with exponential backoff (1s to 30s max)
3. Parse Redfish Event payloads and normalize fields for the UI
4. Send `Last-Event-Id` to replay missed events
5. Support `$filter` for EventType, MessageId, RegistryPrefix, ResourceType,
   and OriginOfCondition
6. Support MetricReport events for sensor updates (TelemetryService)
7. Handle heartbeats and EventBufferExceeded responses
8. Backup relevant SSE store items to localStorage for browser refresh

Non-functional requirements:

1. No new npm dependencies (use browser-native EventSource)
2. Graceful degradation: fall back to polling when SSE is unavailable
3. Bounded memory for client-side buffers (limit to 100 events)
4. Bundle size impact target under 5 KB for SSE-related code

This feature is runtime optional. SSE is enabled only when authenticated and
may be disabled via configuration. All endpoints are standard Redfish.

## Proposed Design

The solution introduces a Pinia SSE store, a composable to manage the
EventSource lifecycle, and a shared event parsing layer that normalizes Redfish
Event payloads. Vue Query is used to invalidate caches when events reference
resources.

ASCII overview:

  ┌──────────────────── Vue 3 Application ─────────────────────┐
  │ Pinia SSE Store ◄── useSSE() ──► Query invalidation         │
  │        ▲                 ▲               ▲                 │
  │        │                 │               │                 │
  │   UI Components      Event parsing   Toast/alerts          │
  └───────────────────────────┬───────────────────────────────┘
                              │
                              ▼
                  /redfish/v1/EventService/SSE

Connection and auth:

- SSE uses the existing authenticated session cookies.
- The endpoint requires the same privilege as POSTing a subscription.
- On auth expiry or 401/403 responses, the client stops reconnecting until
  the user logs in again.
- Multiple tabs must respect the 10 SSE subscription limit.

Event parsing:

- The client extracts fields from `Event` payloads (`Events[]` records) and
  preserves Redfish field names and structure wherever possible, avoiding
  UI-specific normalization unless required for display.
- The parser handles:
  - `EventId`, `EventType`, `EventTimestamp`
  - `Message`, `MessageId`, `MessageArgs`
  - `OriginOfCondition` (as `@odata.id` when present)
  - `Severity` and `Resolution`
- Heartbeat events are handled as informational updates and may use event
  ID 0.
- `EventBufferExceeded` triggers a full refresh of affected views.

Filtering:

- `$filter` is supported and configurable. The default filter keeps events
  relevant to UI modules (EventLog and sensors).
- The filter syntax mirrors bmcweb's accepted filter grammar and supported
  properties.

Fallback behavior:

- When SSE is disabled, unavailable, or repeatedly failing, the UI falls
  back to existing polling only, without introducing new polling paths. As
  SSE coverage grows, existing polling should be reduced or removed.
- UI state shows SSE status to avoid silent staleness.

## Alternatives Considered

VueUse `useEventSource`:
Rejected because it adds a new dependency for a small feature and the
project does not currently use VueUse.

WebSocket:
Previously supported and removed: [ws-removal]: https://gerrit.openbmc.org/c/openbmc/webui-vue/+/70641
Rejected because Redfish specifies SSE for EventService and SSE is simpler
for server-to-client events.

Aggressive polling:
Rejected because it increases BMC load and still has latency for critical
alerts.

## Impacts

API impact:
None. Uses existing Redfish endpoints and registries.

Security impact:
Positive. SSE uses existing session cookies and bmcweb enforces subscription
limits and privileges.

Documentation impact:
Adds an SSE usage guide and references to bmcweb event semantics.

Performance impact:
Lower polling load and reduced latency for critical events; minimal client
overhead.

Developer impact:
Introduces shared SSE infrastructure and event normalization, enabling simple
integration for new views.

Upgradability impact:
No vendor-specific extensions required; adheres to Redfish EventService.

### Organizational

- Does this proposal require a new repository? No
- Who will be the initial maintainer(s) of this repository? Jason Westover
- Which repositories are expected to be modified? openbmc/webui-vue

## Testing

Unit tests:

- SSE store state transitions and bounded buffer behavior
- Event parsing against sample payloads and EventBufferExceeded
- Reconnection backoff and auth-failure behavior

Integration tests:

- Mock SSE endpoint with replay (Last-Event-Id) and heartbeats
- Cache invalidation on resource events

Manual testing:

1. Log in and verify SSE connection establishment in the Network tab
2. Trigger a BMC event and confirm immediate EventLog update
3. Disconnect network and verify reconnection backoff and fallback
4. Open multiple tabs and verify subscription limit handling

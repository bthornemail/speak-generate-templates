# CanvasL Org Protocol RFC2119 Specification

**Version 1.0 — January 2025**  
**Formal Specification for CanvasL Org Protocol Integration**

---

## Status of This Document

This document specifies the CanvasL Org Protocol integration, including protocol handler registration, RPC command execution, source block projection, and protocol routing. This specification uses RFC 2119 keywords to indicate requirement levels.

**Keywords**: The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Terminology](#2-terminology)
3. [Protocol Handler Registration Requirements](#3-protocol-handler-registration-requirements)
4. [Protocol Handler Execution Requirements](#4-protocol-handler-execution-requirements)
5. [RPC Command Requirements](#5-rpc-command-requirements)
6. [Source Block Projection Requirements](#6-source-block-projection-requirements)
7. [Protocol Routing Requirements](#7-protocol-routing-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Performance Requirements](#9-performance-requirements)
10. [Error Handling Requirements](#10-error-handling-requirements)
11. [Integration Requirements](#11-integration-requirements)
12. [Validation Requirements](#12-validation-requirements)
13. [Implementation Requirements](#13-implementation-requirements)

---

## 1. Introduction

### 1.1 Scope

This specification defines the requirements for CanvasL Org Protocol integration, including:

- Protocol handler registration and execution
- RPC command execution via protocol handlers
- Source block projection to Canvas API via protocol handlers
- Protocol routing and conflict resolution
- Security and performance requirements
- Error handling and validation requirements
- Integration with Org Mode, Canvas API, and MetaLog

### 1.2 Purpose

The purpose of this specification is to:

1. Define a formal standard for CanvasL Org Protocol integration
2. Enable protocol handler registration and execution
3. Enable RPC command execution via protocol handlers
4. Enable source block projection to Canvas API via protocol handlers
5. Enable protocol routing and conflict resolution
6. Ensure security and performance requirements
7. Ensure error handling and validation requirements

### 1.3 RFC 2119 Keyword Usage

This specification uses RFC 2119 keywords to indicate requirement levels:

- **MUST** / **REQUIRED** / **SHALL**: Absolute requirement
- **MUST NOT** / **SHALL NOT**: Absolute prohibition
- **SHOULD** / **RECOMMENDED**: Recommended but not required
- **SHOULD NOT** / **NOT RECOMMENDED**: Discouraged but not prohibited
- **MAY** / **OPTIONAL**: Optional feature

---

## 2. Terminology

### 2.1 Protocol Handler Terms

- **Protocol Handler**: Browser API mechanism for registering custom URL schemes
- **Protocol Registration**: Process of registering a protocol handler with the browser
- **Protocol Scheme**: URL scheme prefix (e.g., `canvasl://`, `file://`, `webrtc://`)
- **Handler URL Pattern**: URL pattern template used during protocol handler registration
- **Protocol Routing**: Process of routing a protocol handler URL to the appropriate handler
- **Handler Execution**: Process of executing a protocol handler with a URL

### 2.2 RPC Command Terms

- **RPC Command**: Remote Procedure Call command embedded in an Org Mode source block
- **RPC Command Execution**: Process of executing an RPC command via protocol handlers
- **Command Parsing**: Process of parsing an RPC command from a source block
- **Command Validation**: Process of validating an RPC command before execution
- **Command Composition**: Process of composing multiple RPC commands into a single operation

### 2.3 Source Block Terms

- **Source Block**: Org Mode code block delimited by `#+BEGIN_SRC` and `#+END_SRC`
- **Tangle Directive**: Org Mode source block header argument (`:tangle`) specifying projection target
- **Projection Target**: Destination for source block projection, specified in `:tangle` directive
- **Header Arguments**: Org Mode source block header arguments (`:header-args:*`)
- **CanvasL Properties**: Source block header arguments prefixed with `canvasl:`

### 2.4 Canvas API Terms

- **Canvas API**: API for creating and managing Canvas nodes
- **Canvas Node**: Canvas element representing a component or data structure
- **Node Creation**: Process of creating a Canvas node via Canvas API
- **Topology**: Structure of Canvas nodes and their relationships

---

## 3. Protocol Handler Registration Requirements

### 3.1 Registration API

**REQ-3.1.1**: Protocol handlers **MUST** be registered via `navigator.registerProtocolHandler()`.

**REQ-3.1.2**: Protocol handler registration **SHALL** require user permission.

**REQ-3.1.3**: Protocol handler registration **MUST** specify protocol scheme and handler URL pattern.

**REQ-3.1.4**: Protocol handler registration **SHOULD** validate protocol scheme format.

**REQ-3.1.5**: Protocol handler registration **SHOULD** validate handler URL pattern format.

**REQ-3.1.6**: Protocol handler registration **MAY** support multiple protocol schemes.

### 3.2 Protocol Schemes

**REQ-3.2.1**: Protocol schemes **MUST** follow URL scheme syntax as defined in [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986).

**REQ-3.2.2**: Protocol schemes **SHOULD** use lowercase letters.

**REQ-3.2.3**: Protocol schemes **SHOULD** be descriptive (e.g., `canvasl://`, `file://`, `webrtc://`).

**REQ-3.2.4**: Protocol schemes **MUST NOT** conflict with reserved schemes (e.g., `http://`, `https://`, `file://`).

**REQ-3.2.5**: Protocol schemes **MAY** include version information (e.g., `canvasl-v1://`).

### 3.3 Handler URL Pattern

**REQ-3.3.1**: Handler URL pattern **MUST** include placeholder (`%s`) for actual URL.

**REQ-3.3.2**: Handler URL pattern **SHALL** be a valid URL template.

**REQ-3.3.3**: Handler URL pattern **SHOULD** use HTTPS protocol for security.

**REQ-3.3.4**: Handler URL pattern **MAY** include additional parameters.

### 3.4 Registration Lifecycle

**REQ-3.4.1**: Protocol handler registration **SHALL** persist across browser sessions.

**REQ-3.4.2**: Protocol handler registration **SHOULD** support unregistration.

**REQ-3.4.3**: Protocol handler registration **SHOULD** support registration updates.

**REQ-3.4.4**: Protocol handler registration **MAY** support registration versioning.

---

## 4. Protocol Handler Execution Requirements

### 4.1 Execution Flow

**REQ-4.1.1**: Protocol handler execution **MUST** follow execution flow:
1. Parse protocol handler URL
2. Identify protocol handler
3. Extract URL parameters
4. Validate URL parameters
5. Execute protocol handler
6. Return execution result

**REQ-4.1.2**: Protocol handler execution **SHALL** validate URL before execution.

**REQ-4.1.3**: Protocol handler execution **SHOULD** handle execution errors gracefully.

**REQ-4.1.4**: Protocol handler execution **MAY** support execution timeouts.

### 4.2 URL Parsing

**REQ-4.2.1**: Protocol handler URLs **MUST** be parsed according to URL syntax.

**REQ-4.2.2**: Protocol handler URLs **SHALL** extract protocol scheme.

**REQ-4.2.3**: Protocol handler URLs **SHALL** extract URL parameters.

**REQ-4.2.4**: Protocol handler URLs **SHOULD** validate URL format.

**REQ-4.2.5**: Protocol handler URLs **MAY** support URL encoding/decoding.

### 4.3 Handler Identification

**REQ-4.3.1**: Protocol handler identification **MUST** match protocol scheme.

**REQ-4.3.2**: Protocol handler identification **SHALL** resolve handler conflicts.

**REQ-4.3.3**: Protocol handler identification **SHOULD** use handler priority.

**REQ-4.3.4**: Protocol handler identification **MAY** support handler versioning.

### 4.4 Execution Result

**REQ-4.4.1**: Protocol handler execution **SHALL** return execution result.

**REQ-4.4.2**: Execution result **SHOULD** include success/failure status.

**REQ-4.4.3**: Execution result **SHOULD** include error information on failure.

**REQ-4.4.4**: Execution result **MAY** include execution metadata.

---

## 5. RPC Command Requirements

### 5.1 RPC Command Format

**REQ-5.1.1**: RPC commands **MUST** be embedded in Org Mode source blocks.

**REQ-5.1.2**: RPC commands **SHALL** use `:header-args:canvasl:rpc "true"` property.

**REQ-5.1.3**: RPC commands **SHALL** specify command name and parameters.

**REQ-5.1.4**: RPC commands **SHOULD** follow RPC command syntax.

**REQ-5.1.5**: RPC commands **MAY** support command chaining.

### 5.2 Command Parsing

**REQ-5.2.1**: RPC command parsing **MUST** extract command name.

**REQ-5.2.2**: RPC command parsing **SHALL** extract command parameters.

**REQ-5.2.3**: RPC command parsing **SHOULD** validate command syntax.

**REQ-5.2.4**: RPC command parsing **MAY** support parameter types.

### 5.3 Command Validation

**REQ-5.3.1**: RPC command validation **MUST** validate command name.

**REQ-5.3.2**: RPC command validation **SHALL** validate command parameters.

**REQ-5.3.3**: RPC command validation **SHOULD** validate command permissions.

**REQ-5.3.4**: RPC command validation **MAY** validate command dependencies.

### 5.4 Command Execution

**REQ-5.4.1**: RPC command execution **MUST** execute via protocol handlers.

**REQ-5.4.2**: RPC command execution **SHALL** invoke Canvas API operations.

**REQ-5.4.3**: RPC command execution **SHOULD** handle execution errors.

**REQ-5.4.4**: RPC command execution **MAY** support command transactions.

### 5.5 Command Composition

**REQ-5.5.1**: RPC command composition **SHOULD** support command chaining.

**REQ-5.5.2**: RPC command composition **SHOULD** support command dependencies.

**REQ-5.5.3**: RPC command composition **MAY** support command transactions.

**REQ-5.5.4**: RPC command composition **MAY** support command rollback.

---

## 6. Source Block Projection Requirements

### 6.1 Projection Pipeline

**REQ-6.1.1**: Source block projection **MUST** follow projection pipeline:
1. Parse source block header
2. Extract `:tangle` target
3. Extract `:header-args:canvasl:*` properties
4. Execute/extract source block content
5. Register protocol handler if needed
6. Project to Canvas API via protocol handler

**REQ-6.1.2**: Source block projection **SHALL** validate source block headers.

**REQ-6.1.3**: Source block projection **SHOULD** handle projection errors gracefully.

**REQ-6.1.4**: Source block projection **MAY** support projection timeouts.

### 6.2 Tangle Directive

**REQ-6.2.1**: Source blocks **MUST** use `:tangle` directive for Canvas projection.

**REQ-6.2.2**: The `:tangle` directive **SHALL** specify projection target.

**REQ-6.2.3**: The `:tangle` directive **SHOULD** use protocol handlers.

**REQ-6.2.4**: The `:tangle` directive **MAY** specify multiple targets.

### 6.3 CanvasL Properties

**REQ-6.3.1**: Source blocks **MUST** use `:header-args:canvasl:*` for CanvasL properties.

**REQ-6.3.2**: The `:header-args:canvasl:projection` property **SHOULD** specify projection type.

**REQ-6.3.3**: The `:header-args:canvasl:dimension` property **SHOULD** specify chain complex dimension.

**REQ-6.3.4**: The `:header-args:canvasl:protocol` property **SHOULD** specify protocol handler type.

**REQ-6.3.5**: The `:header-args:canvasl:rpc` property **MUST** be `"true"` for RPC command source blocks.

### 6.4 Source Block Types

**REQ-6.4.1**: Source blocks **SHOULD** support SVG source type.

**REQ-6.4.2**: Source blocks **SHOULD** support JavaScript source type.

**REQ-6.4.3**: Source blocks **SHOULD** support CanvasL source type.

**REQ-6.4.4**: Source blocks **SHOULD** support Markdown source type.

**REQ-6.4.5**: Source blocks **MAY** support other source types.

---

## 7. Protocol Routing Requirements

### 7.1 Routing Algorithm

**REQ-7.1.1**: Protocol routing **MUST** identify protocol handler from URL scheme.

**REQ-7.1.2**: Protocol routing **SHALL** resolve handler conflicts.

**REQ-7.1.3**: Protocol routing **SHOULD** use handler priority.

**REQ-7.1.4**: Protocol routing **MAY** support handler versioning.

### 7.2 Conflict Resolution

**REQ-7.2.1**: Protocol routing **MUST** resolve handler conflicts.

**REQ-7.2.2**: Conflict resolution **SHALL** use handler priority.

**REQ-7.2.3**: Conflict resolution **SHOULD** support user selection.

**REQ-7.2.4**: Conflict resolution **MAY** support handler versioning.

### 7.3 Routing Performance

**REQ-7.3.1**: Protocol routing **SHOULD** optimize routing performance.

**REQ-7.3.2**: Protocol routing **SHOULD** cache handler routes.

**REQ-7.3.3**: Protocol routing **MAY** support route precomputation.

**REQ-7.3.4**: Protocol routing **MAY** support route optimization.

---

## 8. Security Requirements

### 8.1 URL Validation

**REQ-8.1.1**: Protocol handler URLs **MUST** be validated before execution.

**REQ-8.1.2**: URL validation **SHALL** check URL format.

**REQ-8.1.3**: URL validation **SHOULD** check URL scheme.

**REQ-8.1.4**: URL validation **SHOULD** prevent malicious URLs.

**REQ-8.1.5**: URL validation **MAY** check URL permissions.

### 8.2 Permission Management

**REQ-8.2.1**: Protocol handler permissions **MUST** be managed.

**REQ-8.2.2**: Permission management **SHALL** support registration.

**REQ-8.2.3**: Permission management **SHALL** support revocation.

**REQ-8.2.4**: Permission management **SHOULD** support audit logging.

**REQ-8.2.5**: Permission management **MAY** support permission delegation.

### 8.3 Audit Logging

**REQ-8.3.1**: Protocol handler execution **SHOULD** be logged for auditing.

**REQ-8.3.2**: Audit logging **SHALL** include execution timestamp.

**REQ-8.3.3**: Audit logging **SHOULD** include execution URL.

**REQ-8.3.4**: Audit logging **SHOULD** include execution result.

**REQ-8.3.5**: Audit logging **MAY** include execution metadata.

### 8.4 Sandboxing

**REQ-8.4.1**: Protocol handler execution **SHOULD** be sandboxed.

**REQ-8.4.2**: Sandboxing **SHALL** isolate execution context.

**REQ-8.4.3**: Sandboxing **SHOULD** prevent unauthorized resource access.

**REQ-8.4.4**: Sandboxing **MAY** support sandbox configuration.

---

## 9. Performance Requirements

### 9.1 Execution Latency

**REQ-9.1.1**: Protocol handler execution **SHOULD** minimize execution latency.

**REQ-9.1.2**: Execution latency **SHOULD** be less than 100ms for simple operations.

**REQ-9.1.3**: Execution latency **MAY** be higher for complex operations.

**REQ-9.1.4**: Execution latency **SHOULD** be measured and monitored.

### 9.2 Routing Performance

**REQ-9.2.1**: Protocol routing **SHOULD** optimize routing performance.

**REQ-9.2.2**: Routing performance **SHOULD** be less than 10ms.

**REQ-9.2.3**: Routing performance **MAY** be optimized with caching.

**REQ-9.2.4**: Routing performance **SHOULD** be measured and monitored.

### 9.3 Caching

**REQ-9.3.1**: Protocol routing **SHOULD** cache handler routes.

**REQ-9.3.2**: Caching **SHALL** invalidate cache on handler updates.

**REQ-9.3.3**: Caching **SHOULD** optimize cache hit rate.

**REQ-9.3.4**: Caching **MAY** support cache configuration.

---

## 10. Error Handling Requirements

### 10.1 Error Types

**REQ-10.1.1**: Protocol handler execution **MUST** handle execution errors.

**REQ-10.1.2**: Error handling **SHALL** distinguish error types.

**REQ-10.1.3**: Error handling **SHOULD** provide error messages.

**REQ-10.1.4**: Error handling **MAY** support error recovery.

### 10.2 Error Reporting

**REQ-10.2.1**: Error reporting **SHALL** include error type.

**REQ-10.2.2**: Error reporting **SHOULD** include error message.

**REQ-10.2.3**: Error reporting **SHOULD** include error context.

**REQ-10.2.4**: Error reporting **MAY** include error stack trace.

### 10.3 Error Recovery

**REQ-10.3.1**: Error recovery **SHOULD** support retry mechanisms.

**REQ-10.3.2**: Error recovery **SHOULD** support fallback strategies.

**REQ-10.3.3**: Error recovery **MAY** support error rollback.

**REQ-10.3.4**: Error recovery **MAY** support error notification.

---

## 11. Integration Requirements

### 11.1 Org Mode Integration

**REQ-11.1.1**: Protocol handlers **MUST** integrate with Org Mode parser.

**REQ-11.1.2**: Integration **SHALL** support source block projection.

**REQ-11.1.3**: Integration **SHOULD** support property drawer mapping.

**REQ-11.1.4**: Integration **MAY** support Org Mode directives.

### 11.2 Canvas API Integration

**REQ-11.2.1**: Protocol handlers **MUST** integrate with Canvas API.

**REQ-11.2.2**: Integration **SHALL** support node creation.

**REQ-11.2.3**: Integration **SHOULD** support node updates.

**REQ-11.2.4**: Integration **MAY** support node queries.

### 11.3 MetaLog Integration

**REQ-11.3.1**: Protocol handlers **SHOULD** integrate with MetaLog blackboard.

**REQ-11.3.2**: Integration **SHALL** support blackboard coordination.

**REQ-11.3.3**: Integration **SHOULD** support event-driven architecture.

**REQ-11.3.4**: Integration **MAY** support blackboard queries.

### 11.4 WebRTC Integration

**REQ-11.4.1**: Protocol handlers **MAY** integrate with WebRTC collaboration.

**REQ-11.4.2**: Integration **SHOULD** support peer synchronization.

**REQ-11.4.3**: Integration **MAY** support presence tracking.

**REQ-11.4.4**: Integration **MAY** support conflict resolution.

---

## 12. Validation Requirements

### 12.1 URL Validation

**REQ-12.1.1**: Protocol handler URLs **MUST** be validated before execution.

**REQ-12.1.2**: URL validation **SHALL** check URL format.

**REQ-12.1.3**: URL validation **SHOULD** check URL scheme.

**REQ-12.1.4**: URL validation **MAY** check URL permissions.

### 12.2 Command Validation

**REQ-12.2.1**: RPC commands **MUST** be validated before execution.

**REQ-12.2.2**: Command validation **SHALL** check command syntax.

**REQ-12.2.3**: Command validation **SHOULD** check command parameters.

**REQ-12.2.4**: Command validation **MAY** check command permissions.

### 12.3 Projection Validation

**REQ-12.3.1**: Source block projections **SHOULD** be validated after projection.

**REQ-12.3.2**: Projection validation **SHALL** check projection result.

**REQ-12.3.3**: Projection validation **SHOULD** check projection consistency.

**REQ-12.3.4**: Projection validation **MAY** check projection topology.

---

## 13. Implementation Requirements

### 13.1 Browser Compatibility

**REQ-13.1.1**: Protocol handlers **SHOULD** support modern browsers.

**REQ-13.1.2**: Browser compatibility **SHALL** be tested.

**REQ-13.1.3**: Browser compatibility **SHOULD** include fallback mechanisms.

**REQ-13.1.4**: Browser compatibility **MAY** support browser-specific features.

### 13.2 Testing

**REQ-13.2.1**: Protocol handlers **MUST** be tested.

**REQ-13.2.2**: Testing **SHALL** include unit tests.

**REQ-13.2.3**: Testing **SHOULD** include integration tests.

**REQ-13.2.4**: Testing **MAY** include performance tests.

### 13.3 Documentation

**REQ-13.3.1**: Protocol handlers **SHOULD** be documented.

**REQ-13.3.2**: Documentation **SHALL** include API reference.

**REQ-13.3.3**: Documentation **SHOULD** include usage examples.

**REQ-13.3.4**: Documentation **MAY** include troubleshooting guide.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Specification Complete


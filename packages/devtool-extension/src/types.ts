export enum SyftEventTrackStatus {
  TRACKED, // event is modeled and instrumented using syft.
  SEMI_TRACKED, // event is modeled, but the library is not being used.
  NOT_TRACKED, // event is not modeled.
}

export enum SyftEventValidStatus {
  VALID, // event data is valid.
  NOT_VALID, // event data is not valid.
  UNKNOWN, // we don't know if the event data is valid.
}

export enum SyftEventInstrumentStatus {
  INSTRUMENTED, // event is instrumented.
  NOT_INSTRUMENTED, // event is not instrumented.
  NOT_INSTRUMENTED_VERBOSE, // event is not instrumented, and includes a lot of events.
}

export interface SyftEvent {
  createdAt: Date
  name: string
  props: Record<string, any>
  syft_status: {
    tracked: SyftEventTrackStatus
    valid: SyftEventValidStatus
    instrumented: SyftEventInstrumentStatus
  }
}

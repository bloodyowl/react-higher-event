// @flow
type EventType = SyntheticEvent<> | KeyboardEvent

export type EventHandler = (event: EventType) => mixed

export type EventProps = {
    [eventName: string]: EventHandler,
}

export type Events = Map<string, Set<EventHandler>>

export type EventDispatcher = (eventName: string, event: EventType) => mixed

export type Unsubscribe = () => void

export type Subscribe = (eventName: string, handler: EventHandler) => Unsubscribe

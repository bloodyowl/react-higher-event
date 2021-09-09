// @flow
export type EventHandler = (event: SyntheticEvent<>) => mixed

export type EventProps = {|
    [eventName: string]: EventHandler,
|}

export type Events = Map<string, Set<EventHandler>>

export type EventDispatcher = (eventName: string, event: SyntheticEvent<>) => mixed

export type Unsubscribe = () => void

export type Subscribe = (eventName: string, handler: EventHandler) => Unsubscribe

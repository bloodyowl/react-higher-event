// @flow
import * as React from 'react'

import EventPropsContext from './EventPropsContext.js'
import SubscribeContext from './SubscribeContext.js'
import type {
    EventDispatcher,
    EventHandler,
    EventProps,
    Events,
    Subscribe,
} from './ReactHigherEventTypes.js'

const { forwardRef, useContext, useEffect, useRef, useState } = React

type Props = {
    children?: React.Node,
    component?: React.ElementType,
}

const noop = () => {}

const ReactHigherEventProvider = forwardRef(
    ({ children, component, ...extraProps }: Props, ref) => {
        const eventsRef = useRef<Events | null>(null)
        const lastNativeEventRef = useRef<Event | null>(null)

        const [eventProps, setEventProps] = useState<EventProps>(({}: any))
        const [subscribe, setSubscribe] = useState<Subscribe | null>(null)

        useEffect(() => {
            eventsRef.current = new Map()

            const dispatchEvent = (eventName: string, event: SyntheticEvent<>) => {
                const events: Events = (eventsRef.current: any)
                const handlers = events.get(eventName)
                // Check nativeEvent to make sure we haven’t already handled this event
                if (!handlers || event.nativeEvent === lastNativeEventRef.current) {
                    return
                }
                lastNativeEventRef.current = event.nativeEvent
                handlers.forEach((handler) => handler(event))
            }

            // When a function is passed to setState, it’s treated as an updater function
            // https://reactjs.org/docs/hooks-reference.html#functional-updates
            setSubscribe((): Subscribe => (eventName: string, handler: EventHandler) => {
                const events: Events = (eventsRef.current: any)
                let eventHandlers = events.get(eventName)

                if (!eventHandlers) {
                    eventHandlers = new Set()
                    events.set(eventName, eventHandlers)
                }

                eventHandlers.add(handler)

                setEventProps((props: EventProps): EventProps => {
                    if (props[eventName]) return props

                    return {
                        ...props,
                        [eventName]: (event: SyntheticEvent<>) =>
                            dispatchEvent(eventName, event),
                    }
                })

                // Return the cleanup function
                return () => {
                    const handlers = events.get(eventName)
                    if (!handlers) return

                    handlers.delete(handler)
                    // If there are no more handlers for this event, remove it from eventProps
                    if (!handlers.size) {
                        setEventProps((props: EventProps): EventProps => {
                            if (!props[eventName]) return props

                            const { [eventName]: deletedEvent, ...nextProps } = props
                            return nextProps
                        })
                    }
                }
            })
        }, [])

        const Component = component || 'div'

        return (
            <Component {...extraProps} {...eventProps} ref={ref}>
                <EventPropsContext.Provider value={eventProps}>
                    <SubscribeContext.Provider value={subscribe}>
                        {children}
                    </SubscribeContext.Provider>
                </EventPropsContext.Provider>
            </Component>
        )
    },
)

export default ReactHigherEventProvider

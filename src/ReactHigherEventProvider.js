// @flow
import useKeyboardEvents from '@acusti/use-keyboard-events'
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

const { forwardRef, useCallback, useRef, useState } = React

type Props = {
    children?: React.Node,
    component?: React.ElementType,
    ...
}

const ReactHigherEventProvider: React.ComponentType<Props> = forwardRef(
    ({ children, component, ...extraProps }: Props, ref) => {
        const eventsRef = useRef<Events>(new Map())
        const lastNativeEventRef = useRef<Event | null>(null)
        const keyDownHandlersRef = useRef(new Set())
        const keyPressHandlersRef = useRef(new Set())
        const keyUpHandlersRef = useRef(new Set())

        const [eventProps, setEventProps] = useState<EventProps>(({}: any))

        const getEventHandlers = useCallback((eventName: string) => {
            if (eventName === 'onKeyDown') return keyDownHandlersRef.current
            if (eventName === 'onKeyPress') return keyPressHandlersRef.current
            if (eventName === 'onKeyUp') return keyUpHandlersRef.current
            let eventHandlers = eventsRef.current.get(eventName)
            if (!eventHandlers) {
                eventHandlers = new Set()
                eventsRef.current.set(eventName, eventHandlers)
            }
            return eventHandlers
        }, [])

        const dispatchEvent = useCallback(
            (eventName: string, event: SyntheticEvent<>) => {
                const events: Events = eventsRef.current
                const handlers = events.get(eventName)
                // Check nativeEvent to make sure we haven’t already handled this event
                if (!handlers || event.nativeEvent === lastNativeEventRef.current) {
                    return
                }
                lastNativeEventRef.current = event.nativeEvent
                handlers.forEach((handler) => handler(event))
            },
            [],
        )

        useKeyboardEvents({
            onKeyDown: (event) => {
                keyDownHandlersRef.current.forEach((handler) => handler(event))
            },
            onKeyPress: (event) => {
                keyPressHandlersRef.current.forEach((handler) => handler(event))
            },
            onKeyUp: (event) => {
                keyUpHandlersRef.current.forEach((handler) => handler(event))
            },
        })

        const subscribe = useCallback<Subscribe>(
            (eventName: string, handler: EventHandler) => {
                const isKeyboardEvent = eventName.startsWith('onKey')
                const eventHandlers = getEventHandlers(eventName)
                eventHandlers.add(handler)

                setEventProps((props: EventProps): EventProps => {
                    if (isKeyboardEvent || props[eventName]) return props

                    return {
                        ...props,
                        [eventName]: (event: SyntheticEvent<>) =>
                            dispatchEvent(eventName, event),
                    }
                })

                // Return the cleanup function
                return () => {
                    const handlers = getEventHandlers(eventName)
                    handlers.delete(handler)
                    // If there are no more handlers for this event, remove it from eventProps
                    if (!isKeyboardEvent && !handlers.size) {
                        setEventProps((props: EventProps): EventProps => {
                            if (!props[eventName]) return props

                            const { [eventName]: deletedEvent, ...nextProps } = props
                            return nextProps
                        })
                    }
                }
            },
            [],
        )

        const Component = component || 'div'

        return (
            // $FlowExpectedError cannot-spread-indexer from spreading eventProps
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

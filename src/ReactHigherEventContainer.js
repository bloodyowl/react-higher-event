/* @flow */
import * as React from 'react'

import { ContextTypes, ProxyContextTypes } from './ReactHigherEventTypes'
import type { Context, ProxyContext, EventProps } from './ReactHigherEventTypes'

type Props = {
    children?: React.Element<*>,
    component?: React.ElementType,
}
type State = EventProps
type Handler = (event: SyntheticEvent<*>) => void
type ProxyHandler = (eventProps: EventProps) => void

class ReactHigherEventContainer extends React.Component<Props, State> {
    handleEvent: (eventType: string, event: SyntheticEvent<*>) => void
    events: Map<string, Set<Function>> = new Map()
    proxySubscribers: Set<(eventProps: EventProps) => void> = new Set()
    state: State = {}

    componentWillUpdate(nextProps: Props, nextState: State) {
        if (this.state !== nextState) {
            this.proxySubscribers.forEach((subscriber) => subscriber(nextState))
        }
    }

    subscribe = (eventType: string, handler: Handler) => {
        let eventSubscribers = this.events.get(eventType)

        if (!eventSubscribers) {
            eventSubscribers = new Set()
            this.events.set(eventType, eventSubscribers)
            this.updateEventProp({ eventType, create: true })
        }

        eventSubscribers.add(handler)

        return () => {
            const eventSubscribers = this.events.get(eventType)
            if (eventSubscribers) {
                eventSubscribers.delete(handler)
                if (eventSubscribers.size === 0) {
                    this.events.delete(eventType)
                    this.updateEventProp({ eventType, create: false })
                }
            }
        }
    }

    proxySubscribe = (handler: ProxyHandler) => {
        this.proxySubscribers.add(handler)
        handler(this.state)
        return () => {
            this.proxySubscribers.delete(handler)
        }
    }

    updateEventProp({ eventType, create }: { eventType: string, create: boolean }): void {
        this.setState((state: State) => {
            if (Boolean(state[eventType]) === create) return state

            return {
                ...state,
                [eventType]: create ? this.handleEvent.bind(null, eventType) : null,
            }
        })
    }

    lastNativeEvent: ?Event = null
    handleEvent = (eventType: string, event: SyntheticEvent<*>) => {
        if (!this.events.has(eventType) || event.nativeEvent === this.lastNativeEvent) {
            return
        }
        this.lastNativeEvent = event.nativeEvent
        const subscribers = this.events.get(eventType)
        if (subscribers) {
            subscribers.forEach((func) => func(event))
        }
    }

    getChildContext(): Context & ProxyContext {
        return {
            higherEvent: {
                subscribe: this.subscribe,
            },
            higherEventProxy: {
                subscribe: this.proxySubscribe,
            },
        }
    }

    render() {
        const { children, component, ...props } = this.props
        const Component = component || 'div'
        return (
            <Component {...props} {...this.state}>
                {children}
            </Component>
        )
    }
}

ReactHigherEventContainer.childContextTypes = {
    ...ContextTypes,
    ...ProxyContextTypes,
}

export default ReactHigherEventContainer

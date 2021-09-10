// @flow
import * as React from 'react'
import SubscribeContext from './SubscribeContext.js'
import type { EventProps } from './ReactHigherEventTypes.js'

const { useContext, useEffect, useRef } = React

type Props = {
    ...EventProps,
    children: React.Node,
}

type Unsubscribers = { [eventName: string]: () => void }

const ReactHigherEvent = (props: Props) => {
    const subscribe = useContext(SubscribeContext)
    const unsubscribersRef = useRef<Unsubscribers | null>(null)
    const previousPropsRef = useRef<Props | null>(null)

    useEffect(() => {
        unsubscribersRef.current = {}
        // On unmount, call any remaining cleanup functions
        return () => {
            const unsubscribers = unsubscribersRef.current
            if (!unsubscribers) return
            Object.keys(unsubscribers).forEach((key) => {
                unsubscribers[key]()
            })
        }
    }, [])

    // On props changes, call cleanup for any changed handlers and subscribe any new
    useEffect(() => {
        if (!subscribe) return

        const unsubscribers = unsubscribersRef.current || {}
        const previousProps = previousPropsRef.current || {}
        previousPropsRef.current = props

        let previousKeys = Object.keys(previousProps)
        let currentKeys = Object.keys(props)
        let unhandledCurrentKeysCount = currentKeys.length

        previousKeys.forEach((key) => {
            if (key === 'children') return

            if (props[key]) {
                unhandledCurrentKeysCount--
            }

            if (props[key] === previousProps[key]) return

            // If this event handler has changed, call previous handler’s cleanup function
            if (unsubscribers[key]) {
                unsubscribers[key]()
                delete unsubscribers[key]
            }

            // If event handler doesn’t exist in current props, no need to do anything else
            if (!props[key]) return

            // Subscribe the new handler to the event and capture its cleanup function
            unsubscribers[key] = subscribe(key, props[key])
        })

        // If we already handled all new subscriptions, no need to do anything else
        if (!unhandledCurrentKeysCount) return

        currentKeys.forEach((key) => {
            if (key === 'children') return
            // If key exists in previousProps, we already handled it above
            if (previousProps[key]) return
            // If new value is falsey, we already cleaned up above, nothing else to do
            if (!props[key]) return

            unsubscribers[key] = subscribe(key, props[key])
        })
    }, [props, subscribe])

    return props.children
}

export default (ReactHigherEvent: React.ComponentType<Props>)

/* @flow */
import * as React from 'react'
import { ContextTypes } from './ReactHigherEventTypes'

class ReactHigherEvent extends React.Component<Props, void> {
    unsubscribers: { [key: string]: Function }

    componentDidMount() {
        const { higherEvent } = this.context
        const { children, ...props } = this.props
        this.unsubscribers = Object.keys(props).reduce((acc, eventType) => {
            if (typeof props[eventType] === 'function') {
                acc[eventType] = higherEvent.subscribe(eventType, props[eventType])
            }
            return acc
        }, {})
    }

    componentWillUnmount() {
        Object.keys(this.unsubscribers).forEach((key) => {
            this.unsubscribers[key]()
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props === nextProps) return

        const { subscribe } = this.context.higherEvent

        Object.keys(this.props).forEach((key) => {
            if (key === 'children') return

            if (!nextProps[key]) {
                if (typeof this.unsubscribers[key] === 'function') {
                    this.unsubscribers[key]()
                }
                delete this.unsubscribers[key]
            }

            if (nextProps[key] !== this.props[key]) {
                if (typeof this.unsubscribers[key] === 'function') {
                    this.unsubscribers[key]()
                }
                delete this.unsubscribers[key]
                if (typeof nextProps[key] === 'function') {
                    this.unsubscribers[key] = subscribe(key, nextProps[key])
                }
            }
        })

        Object.keys(nextProps).forEach((key) => {
            if (key === 'children') return

            if (!this.props[key]) {
                if (typeof nextProps[key] === 'function') {
                    this.unsubscribers[key] = subscribe(key, nextProps[key])
                }
            }
        })
    }
    render() {
        return React.Children.only(this.props.children)
    }
}

type Props = {
    [key: string]: Function,
    children: React.Element<*>,
}

ReactHigherEvent.contextTypes = ContextTypes

export default ReactHigherEvent

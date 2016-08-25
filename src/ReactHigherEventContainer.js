/* @flow */
import React, { Component } from "react"
import { Element as ReactElement } from "react"

import ReactHigherEventContextTypes from "./ReactHigherEventContextTypes"
import ReactHigherEventProxyContextTypes from "./ReactHigherEventProxyContextTypes"

type EventProps = {
  [key: string]: Function,
}

class ReactHigherEventContainer extends Component<void, Props, void> {
  subscribe: (eventType: string, handler: Function) => () => void;
  events: Map<string, Set<Function>>;
  handleEvent: (eventType: string, event: SyntheticEvent) => void;
  constructor(props: Props) {
    super(props)
    this.subscribe = this.subscribe.bind(this)
    this.handleEvent = this.handleEvent.bind(this)
    this.proxySubscribe = this.proxySubscribe.bind(this)
    this.events = new Map()
    this.proxySubscribers = new Set()
  }
  subscribe(eventType: string, handler: Function): Function {
    let eventSubscribers = this.events.get(eventType)
    if(!eventSubscribers) {
      eventSubscribers = new Set()
      this.events.set(eventType, eventSubscribers)
    }
    eventSubscribers.add(handler)
    this.update()
    return () => {
      const eventSubscribers = this.events.get(eventType)
      if(eventSubscribers) {
        eventSubscribers.delete(handler)
        if(eventSubscribers.size === 0) {
          this.events.delete(eventType)
        }
        this.update()
      }
    }
  }
  proxySubscribe(handler: Function): Function {
    this.proxySubscribers.add(handler)
    return () => {
      this.proxySubscribers.delete(handler)
    }
  }
  update(): void {
    this.forceUpdate()
    this.proxySubscribers.forEach((func) => func())
  }
  handleEvent(eventType: string, event: SyntheticEvent) {
    if(!this.events.has(eventType)) {
      return
    }
    const subscribers = this.events.get(eventType)
    if(subscribers) {
      subscribers.forEach((func) => func(event))
    }
  }
  getEventProps(): EventProps {
    return Array.from(this.events.keys()).reduce((acc, key) => {
      return {
        ...acc,
        [key]: this.handleEvent.bind(null, key),
      }
    }, {})
  }
  getChildContext(): { higherEvent: { subscribe: Function }} {
    return {
      higherEvent: {
        subscribe: this.subscribe,
      },
      higherEventProxy: {
        handleEvent: this.handleEvent,
        events: this.events,
        subscribe: this.proxySubscribe,
      }
    }
  }
  render(): ReactElement {
    const { children, ...props } = this.props
    return (
      <div {...props} {...this.getEventProps()}>
        {children}
      </div>
    )
  }
}

ReactHigherEventContainer.childContextTypes = {
  ...ReactHigherEventContextTypes,
  ...ReactHigherEventProxyContextTypes
}

type Props = {
  children?: any,
}

export default ReactHigherEventContainer

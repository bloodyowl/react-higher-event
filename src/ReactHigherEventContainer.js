/* @flow */
import React, { Component } from "react"
import { Element as ReactElement } from "react"

import ReactHigherEventContextTypes from "./ReactHigherEventContextTypes"

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
    this.events = new Map()
  }
  subscribe(eventType: string, handler: Function): Function {
    let eventSubscribers = this.events.get(eventType)
    if(!eventSubscribers) {
      eventSubscribers = new Set()
      this.events.set(eventType, eventSubscribers)
    }
    eventSubscribers.add(handler)
    this.forceUpdate()
    return () => {
      const eventSubscribers = this.events.get(eventType)
      if(eventSubscribers) {
        eventSubscribers.delete(handler)
        if(eventSubscribers.size === 0) {
          this.events.delete(eventType)
        }
        this.forceUpdate()
      }
    }
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
    }
  }
  render(): ReactElement {
    const { children, component, ...props } = this.props
    const Component = component || "div"
    return (
      <Component {...props} {...this.getEventProps()}>
        {children}
      </Component>
    )
  }
}

ReactHigherEventContainer.childContextTypes = ReactHigherEventContextTypes

type Props = {
  children?: any,
  component?: Function,
}

export default ReactHigherEventContainer

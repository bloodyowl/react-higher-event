/* @flow */
import React, { Component } from "react"
import { Element as ReactElement } from "react"

import {
  ContextTypes,
  ProxyContextTypes,
} from "./ReactHigherEventTypes"
import type {
  Context,
  ProxyContext,
  EventProps,
} from "./ReactHigherEventTypes"

class ReactHigherEventContainer extends Component<void, Props, State> {
  handleEvent: (eventType: string, event: SyntheticEvent) => void;
  subscribe: (eventType: string, handler: Handler) => Function;
  proxySubscribe: (eventType: string, handler: ProxyHandler) => Function;
  events: Map<string, Set<Function>> = new Map();
  proxySubscribers: Set<(eventProps: EventProps) => void> = new Set();
  state: State = {};
  constructor(props: Props) {
    super(props)
    this.subscribe = this.subscribe.bind(this)
    this.handleEvent = this.handleEvent.bind(this)
    this.proxySubscribe = this.proxySubscribe.bind(this)
  }
  componentWillUpdate(nextProps: Props, nextState: State) {
    if(this.state !== nextState) {
      this.proxySubscribers.forEach(
        (subscriber) => subscriber(nextState)
      )
    }
  }
  subscribe(eventType: string, handler: Handler): Function {
    let eventSubscribers = this.events.get(eventType)
    if(!eventSubscribers) {
      eventSubscribers = new Set()
      this.events.set(eventType, eventSubscribers)
      this.updateEventProp({ eventType, create: true })
    }
    eventSubscribers.add(handler)
    return () => {
      const eventSubscribers = this.events.get(eventType)
      if(eventSubscribers) {
        eventSubscribers.delete(handler)
        if(eventSubscribers.size === 0) {
          this.events.delete(eventType)
          this.updateEventProp({ eventType, create: false })
        }
      }
    }
  }
  proxySubscribe(handler: ProxyHandler): Function {
    this.proxySubscribers.add(handler)
    handler(this.state)
    return () => {
      this.proxySubscribers.delete(handler)
    }
  }
  updateEventProp({ eventType, create }: { eventType: string, create: boolean }): void {
    this.setState((state: State) => {
      if(!!state[eventType] === create) {
        return state;
      }
      return {
        ...state,
        [eventType]: create ? this.handleEvent.bind(null, eventType) : null,
      }
    })
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
  getChildContext(): Context & ProxyContext {
    return {
      higherEvent: {
        subscribe: this.subscribe,
      },
      higherEventProxy: {
        subscribe: this.proxySubscribe,
      }
    }
  }
  render(): ReactElement {
    const { children, component, ...props } = this.props
    const Component = component || "div"
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

type Props = {
  children?: any,
  component?: Function,
}
type State = EventProps
type Handler = (event: SyntheticEvent) => void
type ProxyHandler = (eventProps: EventProps) => void

export default ReactHigherEventContainer

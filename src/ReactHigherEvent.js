/* @flow */
import React, { Component, Children } from "react"
import type { Element as ReactElement } from "react"
import { ContextTypes } from "./ReactHigherEventTypes"

class ReactHigherEvent extends Component<void, Props, void> {
  unsubscribers: { [key: string]: Function };
  componentDidMount() {
    const { higherEvent } = this.context
    const { children, ...props } = this.props
    this.unsubscribers = Object.keys(props).reduce((acc, eventType) => {
      if(typeof props[eventType] === "function") {
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
    const { higherEvent } = this.context
    const previousKeys = new Set(Object.keys(this.props))
    const nextKeys = new Set(Object.keys(nextProps))
    previousKeys.forEach((key) => {
      if(key === "children") {
        return
      }
      if(!nextKeys.has(key)) {
        if(typeof this.unsubscribers[key] === "function") {
          this.unsubscribers[key]()
        }
        delete this.unsubscribers[key]
      }
      if(nextProps[key] !== this.props[key]) {
        if(typeof this.unsubscribers[key] === "function") {
          this.unsubscribers[key]()
        }
        delete this.unsubscribers[key]
        if(typeof nextProps[key] === "function") {
          this.unsubscribers[key] = higherEvent.subscribe(key, nextProps[key])
        }
      }
    })
    nextKeys.forEach((key) => {
      if(key === "children") {
        return
      }
      if(!previousKeys.has(key)) {
        if(typeof nextProps[key] === "function") {
          this.unsubscribers[key] = higherEvent.subscribe(key, nextProps[key])
        }
      }
    })
  }
  render(): ReactElement {
    return Children.only(this.props.children)
  }
}

type Props = {
  [key: string]: Function,
  children: ReactElement,
}

ReactHigherEvent.contextTypes = ContextTypes

export default ReactHigherEvent

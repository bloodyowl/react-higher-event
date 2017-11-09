/* @flow */
import React, { Component, PropTypes } from "react"
import { Element as ReactElement } from "react"

import ReactHigherEventProxyContextTypes from "./ReactHigherEventProxyContextTypes"

type EventProps = {
  [key: string]: Function,
}

class ReactHigherEventProxy extends Component<void, Props, void> {
  componentDidMount() {
    const { higherEventProxy } = this.context
    this.unsubscribe = higherEventProxy.subscribe(this.forceUpdate.bind(this))
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  getEventProps(): EventProps {
    const { higherEventProxy } = this.context
    const eventProps = {}
    higherEventProxy.events.forEach((key) => {
      eventProps[key] = (event) => {
        if(this.props[key]) {
          this.props[key](event)
        }
        higherEventProxy.handleEvent(key, event)
      }
    })
    return eventProps
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

ReactHigherEventProxy.contextTypes = ReactHigherEventProxyContextTypes

type Props = {
  children?: any,
}

export default ReactHigherEventProxy

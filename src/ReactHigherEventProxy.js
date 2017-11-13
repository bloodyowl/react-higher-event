/* @flow */
import React, { Component } from "react"
import { Element as ReactElement } from "react"

import { ProxyContextTypes } from "./ReactHigherEventTypes"
import type { EventProps } from "./ReactHigherEventTypes"

class ReactHigherEventProxy extends Component<void, Props, EventProps> {
  unsubscribe: () => void;
  state: EventProps = {};
  componentWillMount() {
    const { subscribe } = this.context.higherEventProxy
    this.unsubscribe = subscribe(this.handleContextUpdate)
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  handleContextUpdate = (nextState: EventProps) => {
    this.setState(nextState)
  }
  render(): ReactElement {
    const { children, handleRef, ...props } = this.props
    return (
      <div {...props} {...this.state} ref={handleRef}>
        {children}
      </div>
    )
  }
}
ReactHigherEventProxy.contextTypes = ProxyContextTypes

type Props = {
  children?: any,
  handleRef?: (ref: ?HTMLElement) => void,
}

export default ReactHigherEventProxy

/* @flow */
import * as React from 'react'

import { ProxyContextTypes } from './ReactHigherEventTypes'
import type { EventProps } from './ReactHigherEventTypes'

class ReactHigherEventProxy extends React.Component<Props, EventProps> {
    unsubscribe: () => void
    state: EventProps = {}

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

    render() {
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
    children?: React.Element<*>,
    handleRef?: (ref: ?HTMLElement) => void,
}

export default ReactHigherEventProxy

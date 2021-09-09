// @flow
import * as React from 'react'
import EventPropsContext from './EventPropsContext.js'
import type { EventProps } from './ReactHigherEventTypes'

const { forwardRef, useContext } = React

type Props = {
    children: React.Node,
}

const ReactHigherEventProxy = forwardRef(({ children, ...extraProps }: Props, ref) => {
    const eventProps = useContext(EventPropsContext)

    return (
        <div {...extraProps} {...eventProps} ref={ref}>
            {children}
        </div>
    )
})

export default ReactHigherEventProxy

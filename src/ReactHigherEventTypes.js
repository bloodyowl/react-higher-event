/* @flow */
import PropTypes from 'prop-types'

export const ContextTypes = {
    higherEvent: PropTypes.shape({
        subscribe: PropTypes.func.isRequired,
    }).isRequired,
}

export const ProxyContextTypes = {
    higherEventProxy: PropTypes.shape({
        subscribe: PropTypes.func.isRequired,
    }).isRequired,
}

export type EventProps = {
    [eventType: string]: (event: SyntheticEvent<*>) => void,
}

export type Context = {
    higherEvent: {
        subscribe: (
            eventType: string,
            handler: (event: SyntheticEvent<*>) => void,
        ) => Function,
    },
}

export type ProxyContext = {
    higherEventProxy: {
        subscribe: ProxySubscribe,
    },
}

export type ProxySubscribe = (handler: (p: EventProps) => void) => Function

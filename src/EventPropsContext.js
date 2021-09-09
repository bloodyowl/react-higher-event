// @flow
import * as React from 'react'
import type { EventProps } from './ReactHigherEventTypes.js'

const EventPropsContext = React.createContext<EventProps | null>(null)

export default (EventPropsContext: React$Context<EventProps | null>)

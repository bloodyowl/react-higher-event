// @flow
import * as React from 'react'
import type { Subscribe } from './ReactHigherEventTypes.js'

const SubscribeContext = React.createContext<Subscribe | null>(null)

export default SubscribeContext

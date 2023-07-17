import React from 'react'
import { ReactHigherEventProvider } from 'react-higher-event'

import Dropdown from './dropdown/Dropdown'

export default function App() {
    return (
        <ReactHigherEventProvider style={{ minHeight: '100vh', minWidth: '100vw' }}>
            <h1 style={{ textAlign: 'center' }}>React Higher Event Examples</h1>
            <ul
                style={{
                    marginTop: '10vh',
                    listStyleType: 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '30px',
                }}
            >
                <li>
                    <h3>Dropdown</h3>
                    <p>
                        <small>(click outside to close)</small>
                    </p>
                    <Dropdown />
                </li>
            </ul>
        </ReactHigherEventProvider>
    )
}

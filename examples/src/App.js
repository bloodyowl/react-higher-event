import React from 'react'
import { ReactHigherEventProvider } from 'react-higher-event'
import Dropdown from './dropdown/Dropdown'

const App = () => (
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
                <h3>Dropdown (click outside)</h3>
                <Dropdown />
            </li>
        </ul>
    </ReactHigherEventProvider>
)

export default App

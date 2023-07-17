import React from 'react'

import { ReactHigherEvent } from 'react-higher-event'

type Props = {}

type State = {
    isOpened: boolean,
}

const styles = {
    button: {
        padding: 10,
        background: '#eee',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingLeft: 10,
        paddingRight: 10,
        cursor: 'pointer',
    },
    openedButton: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    drawer: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 10,
        background: '#ccc',
    },
    drawerItem: {
        padding: 10,
        cursor: 'pointer',
    },
}

const stopPropagation = (event) => event.stopPropagation()

export default function Dropdown(props: Props) {
    const [isOpened, setIsOpened] = React.useState(false)

    const handleClickButton = (event) => {
        if (isOpened) return
        event.stopPropagation()
        setIsOpened(true)
    }

    const handleClickHigher = () => {
        if (!isOpened) return
        setIsOpened(false)
    }

    return (
        <ReactHigherEvent onClick={handleClickHigher}>
            <div
                onClick={handleClickButton}
                style={{
                    ...styles.button,
                    ...(isOpened ? styles.openedButton : null),
                }}
            >
                Open dropdown
            </div>
            {isOpened && (
                <div onClick={stopPropagation} style={styles.drawer}>
                    <div style={styles.drawerItem}>one</div>
                    <div style={styles.drawerItem}>two</div>
                    <div style={styles.drawerItem}>three</div>
                </div>
            )}
        </ReactHigherEvent>
    )
}

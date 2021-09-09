import React, { Component } from 'react'

import { ReactHigherEvent } from 'react-higher-event'

type Props = {}

type State = {
    isOpened: boolean,
}

const styles = {
    container: {
        position: 'relative',
    },
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
        position: 'absolute',
        top: '100%',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 10,
        background: '#ccc',
        left: 0,
        right: 0,
    },
    drawerItem: {
        padding: 10,
        cursor: 'pointer',
    },
}

class Dropdown extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isOpened: false,
        }
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
    }

    open() {
        this.setState({
            isOpened: true,
        })
    }

    close() {
        this.setState({
            isOpened: false,
        })
    }

    handleClick(event) {
        event.stopPropagation()
    }

    render() {
        const { isOpened } = this.state
        return (
            <ReactHigherEvent onClick={isOpened && this.close}>
                <div onClick={this.open} style={styles.container}>
                    <div
                        style={{
                            ...styles.button,
                            ...(isOpened ? styles.openedButton : null),
                        }}
                    >
                        Open dropdown
                    </div>
                    {isOpened && (
                        <div style={styles.drawer} onClick={this.handleClick}>
                            <div style={styles.drawerItem}>one</div>
                            <div style={styles.drawerItem}>two</div>
                            <div style={styles.drawerItem}>three</div>
                        </div>
                    )}
                </div>
            </ReactHigherEvent>
        )
    }
}

export default Dropdown

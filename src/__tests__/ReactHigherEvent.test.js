import { cleanup, render, fireEvent, waitFor, screen } from '@testing-library/react'
import React from 'react'
import { createPortal } from 'react-dom'
import { afterEach, describe, expect, it } from 'vitest'

import {
    ReactHigherEvent,
    ReactHigherEventProvider,
    ReactHigherEventProxy,
} from '../index.js'

class IframePortal extends React.Component {
    state = { iframeElement: null }

    handleRef = (ref) => {
        if (ref === this.state.iframeElement) return
        this.setState({ iframeElement: ref })
    }

    handleClick = (event) => {
        // Prevent event from bubbling from within iframe to parent document
        event.stopPropagation()
    }

    render() {
        const { iframeElement } = this.state
        let portal = null
        if (iframeElement && iframeElement.contentDocument) {
            portal = createPortal(this.props.children, iframeElement.contentDocument.body)
        }

        return (
            <div onClick={this.handleClick}>
                <iframe data-testid="iframe" ref={this.handleRef} />
                {portal}
            </div>
        )
    }
}

describe('ReactHigherEventProvider', () => {
    afterEach(() => {
        cleanup()
    })

    it('lets components handle higher events', () => {
        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                expect(event.target.textContent).toBe('Title')
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div>ok</div>
                    </ReactHigherEvent>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <h1>Title</h1>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        fireEvent.click(screen.getByText('Title'))
    })

    it('is able to call multiple subscribers', () => {
        let clickCount = 0

        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                clickCount++
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div>ok</div>
                    </ReactHigherEvent>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <h1>Title</h1>
                    <ReceiverComponent />
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        fireEvent.click(screen.getByText('Title'))
        expect(clickCount).toBe(2)
    })

    it('allows consumers to unsubscribe', () => {
        class ReceiverComponent extends React.Component {
            state = { clickCount: 0 }

            handleGlobalClick = (event) => {
                this.setState(
                    {
                        clickCount: this.state.clickCount + 1,
                    },
                    () => {
                        expect(this.state.clickCount).toBe(1)
                    },
                )
            }

            render() {
                return (
                    <ReactHigherEvent
                        onClick={
                            this.state.clickCount > 0 ? this.handleGlobalClick : null
                        }
                    >
                        <div>ok</div>
                    </ReactHigherEvent>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <h1>Title</h1>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        fireEvent.click(screen.getByText('Title'))
        fireEvent.click(screen.getByText('Title'))
    })

    it('allows components to stop propagation to higher events', () => {
        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                expect(false).toBe(true)
            }

            handleClick = (event) => {
                event.stopPropagation()
                expect(event.target).toBe(this.target)
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div onClick={this.handleClick} ref={(c) => (this.target = c)}>
                            ok
                        </div>
                    </ReactHigherEvent>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        fireEvent.click(screen.getByText('ok'))
    })

    it('allows passing in alternative tags for ReactHigherEventProvider wrapper', () => {
        const promise = new Promise((resolve, reject) => {
            const handleRef = (ref) => {
                if (!ref) return
                expect(ref.tagName).toBe('SPAN')
                resolve()
            }

            render(
                <ReactHigherEventProvider component="span" ref={handleRef}>
                    <a>Anchor Element</a>
                </ReactHigherEventProvider>,
            )
        })

        return promise
    })

    it('supports using custom components for ReactHigherEventProvider', () => {
        const CustomComponent = (props) => (
            <article>This is an article{props.children}</article>
        )

        render(
            <ReactHigherEventProvider component={CustomComponent}>
                <a>Anchor Element</a>
            </ReactHigherEventProvider>,
        )

        expect(screen.getByText('This is an article').tagName).toBe('ARTICLE')
        expect(screen.getByText('Anchor Element').tagName).toBe('A')
    })

    it('proxies events to root container from inside an iframe', async () => {
        let clickCount = 0

        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                clickCount++
                expect(event.target.ownerDocument).not.toBe(this.node.ownerDocument)
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div ref={(c) => (this.node = c)}>outside iframe</div>
                    </ReactHigherEvent>
                )
            }
        }

        let innerNode
        class Inner extends React.Component {
            render() {
                return (
                    <div data-testid="inside-iframe" ref={(c) => (innerNode = c)}>
                        inside iframe
                    </div>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <IframePortal>
                        <ReactHigherEventProxy>
                            <Inner />
                        </ReactHigherEventProxy>
                    </IframePortal>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        let insideIframeElement = null

        await waitFor(() => {
            // `waitFor` waits until the callback doesn't throw an error
            const iframe = screen.getByTestId('iframe')
            insideIframeElement = iframe.contentDocument.querySelector(
                '[data-testid="inside-iframe"]',
            )
            if (!insideIframeElement) {
                throw new Error('portal not yet rendered')
            }
        })

        fireEvent.click(insideIframeElement)
        expect(clickCount).toBe(1)
    })

    it('shouldn’t re-render when other components add or remove subscribers', () => {
        let renderCount = 0
        let clickCount = 0
        let mouseOverCount = 0

        class ReceiverComponent extends React.Component {
            state = { clicked: false }

            handleGlobalClick = () => {
                clickCount++
                this.setState({ clicked: true })
            }

            handleGlobalMouseOver = () => {
                mouseOverCount++
            }

            render() {
                renderCount++

                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        {this.state.clicked ? (
                            <ReactHigherEvent onMouseOver={this.handleGlobalMouseOver}>
                                <div>ok</div>
                            </ReactHigherEvent>
                        ) : (
                            <div>ok</div>
                        )}
                    </ReactHigherEvent>
                )
            }
        }

        render(
            <ReactHigherEventProvider>
                <ReceiverComponent />
            </ReactHigherEventProvider>,
        )

        // Initial render adds onClick handler; ContextProvider should prevent any re-renders
        expect(renderCount).toBe(1)
        expect(clickCount).toBe(0)
        expect(mouseOverCount).toBe(0)

        // Click updates component state, causing a re-render
        fireEvent.click(screen.getByText('ok'))
        expect(renderCount).toBe(2)
        expect(clickCount).toBe(1)
        expect(mouseOverCount).toBe(0)

        // Mouseover should leave render count unchanged
        fireEvent.mouseOver(screen.getByText('ok'))
        expect(renderCount).toBe(2)
        expect(clickCount).toBe(1)
        expect(mouseOverCount).toBe(1)
    })

    it('only updates proxy when event types are added or removed', () => {
        let renderCount = 0
        let clickCount = 0
        let mouseOverCount = 0
        let stage2ClickCount = 0

        class ReceiverComponent extends React.Component {
            state = { stage: 0 }

            handleGlobalClick = (event) => {
                clickCount++
                if (this.state.stage === 0) {
                    this.setState({ stage: 1 })
                }
            }

            handleGlobalMouseOver = (event) => {
                mouseOverCount++
                if (this.state.stage === 1) {
                    this.setState({ stage: 2 })
                }
            }

            render() {
                renderCount++
                return (
                    <ReactHigherEvent
                        onClick={this.handleGlobalClick}
                        onMouseOver={this.state.stage ? this.handleGlobalMouseOver : null}
                    >
                        {this.state.stage === 2 ? (
                            <ReactHigherEvent onClick={() => stage2ClickCount++}>
                                <div>ok</div>
                            </ReactHigherEvent>
                        ) : (
                            <div>ok</div>
                        )}
                    </ReactHigherEvent>
                )
            }
        }

        let innerNode
        let innerRenderCount = 0

        const Inner = () => {
            innerRenderCount++
            return (
                <div data-testid="inside-iframe" ref={(c) => (innerNode = c)}>
                    inside iframe
                </div>
            )
        }

        render(
            <ReactHigherEventProvider>
                <div>
                    <IframePortal>
                        <ReactHigherEventProxy>
                            <Inner />
                        </ReactHigherEventProxy>
                    </IframePortal>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventProvider>,
        )

        // Initial render adds onClick handler which shouldn’t trigger any additional renders
        expect(renderCount).toBe(1)
        expect(innerRenderCount).toBe(1)

        fireEvent.mouseOver(innerNode)
        // Mouseover handler not yet attached, should have done nothing
        expect(mouseOverCount).toBe(0)
        expect(renderCount).toBe(1)

        fireEvent.click(innerNode)
        // Click updates state, render adds onMouseOver handler; total of one more render
        expect(renderCount).toBe(2)
        // No additional inner re-renders
        expect(innerRenderCount).toBe(1)
        expect(clickCount).toBe(1)

        fireEvent.mouseOver(innerNode)
        // Mouseover updates state, render adds new ReactHigherEvent component; one more render
        expect(renderCount).toBe(3)
        // No additional inner re-renders
        expect(innerRenderCount).toBe(1)
        expect(mouseOverCount).toBe(1)
        expect(stage2ClickCount).toBe(0)

        fireEvent.click(innerNode)
        expect(renderCount).toBe(3)
        expect(innerRenderCount).toBe(1)
        expect(clickCount).toBe(2)
        expect(stage2ClickCount).toBe(1)
    })
})

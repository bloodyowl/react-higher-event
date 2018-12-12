jest.disableAutomock()

const React = require('react')
const ReactDOM = require('react-dom')
const TestUtils = require('react-dom/test-utils')
const ReactHigherEventContainer = require('../ReactHigherEventContainer').default
const ReactHigherEventProxy = require('../ReactHigherEventProxy').default
const ReactHigherEvent = require('../ReactHigherEvent').default

describe('ReactHigherEventContainer', () => {
    it('should let components handle higher events', () => {
        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                expect(event.target.parentNode.parentNode).toBe(null)
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div>ok</div>
                    </ReactHigherEvent>
                )
            }
        }

        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer>
                <div>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
        )

        TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
    })

    it('should be able to call multiple subscribers', () => {
        let clickCount = 0
        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                ++clickCount
            }

            render() {
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        <div>ok</div>
                    </ReactHigherEvent>
                )
            }
        }

        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer>
                <div>
                    <ReceiverComponent />
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
        )

        TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
        expect(clickCount).toBe(2)
    })

    it('should be able to unsubscribe', () => {
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

        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer>
                <div>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
        )

        TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
        TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
    })

    it('should let components stop propagation to higher events', () => {
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

        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer>
                <div>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
        )

        const receiver = TestUtils.findRenderedComponentWithType(tree, ReceiverComponent)
        const div = TestUtils.findRenderedDOMComponentWithTag(receiver, 'div')
        TestUtils.Simulate.click(div)
    })

    it('should let us use other tags for ReactHigherEventContainer', () => {
        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer component={'span'}>
                <a />
            </ReactHigherEventContainer>,
        )

        expect(() => {
            const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div')
        }).toThrow()

        const span = TestUtils.findRenderedDOMComponentWithTag(tree, 'span')
        expect(span).toBeTruthy()
    })

    it('should let us use custom component for ReactHigherEventContainer', () => {
        const Compo = (props) => <article>{props.children}</article>
        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer component={Compo}>
                <a />
            </ReactHigherEventContainer>,
        )

        expect(() => {
            const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div')
        }).toThrow()

        const span = TestUtils.findRenderedDOMComponentWithTag(tree, 'article')
        expect(span).toBeTruthy()
    })

    it('should proxy to root container from across an iframe', () => {
        let clickCount = 0

        class Iframe extends React.Component {
            componentDidMount() {
                const doc = ReactDOM.findDOMNode(this).contentWindow.document
                doc.open()
                doc.write('<!doctype html><html><body><div></div></body></html>')
                doc.close()

                const mountTarget = doc.body.children[0]
                ReactDOM.unstable_renderSubtreeIntoContainer(
                    this,
                    this.props.children,
                    mountTarget,
                )
            }

            render() {
                return <iframe />
            }
        }

        class ReceiverComponent extends React.Component {
            handleGlobalClick = (event) => {
                ++clickCount
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
                return <div ref={(c) => (innerNode = c)}>inside iframe</div>
            }
        }

        const mount = document.body.appendChild(document.createElement('div'))
        const tree = ReactDOM.render(
            <ReactHigherEventContainer>
                <div>
                    <Iframe>
                        <ReactHigherEventProxy>
                            <Inner />
                        </ReactHigherEventProxy>
                    </Iframe>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
            mount,
        )

        TestUtils.Simulate.click(innerNode)
        expect(clickCount).toBe(1)
        mount.parentNode.removeChild(mount)
    })

    it('shouldn’t re-render when other components add or remove subscribers', () => {
        let renderCount = 0
        class ReceiverComponent extends React.Component {
            state = { clicked: false }

            handleGlobalClick = (event) => {
                if (!this.state.clicked) {
                    this.setState({ clicked: true })
                }
            }

            render() {
                ++renderCount
                return (
                    <ReactHigherEvent onClick={this.handleGlobalClick}>
                        {this.clicked ? (
                            <ReactHigherEvent onMouseOver={() => {}}>
                                <div>ok</div>
                            </ReactHigherEvent>
                        ) : (
                            <div>ok</div>
                        )}
                    </ReactHigherEvent>
                )
            }
        }

        const tree = TestUtils.renderIntoDocument(
            <ReactHigherEventContainer>
                <ReceiverComponent />
            </ReactHigherEventContainer>,
        )

        // Initial render adds onClick handler which triggers additional render
        expect(renderCount).toBe(2)

        // Click updates state, render adds new component with onMouseOver handler
        TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
        expect(renderCount).toBe(3)

        // Mouseover should leave render count unchanged
        TestUtils.Simulate.mouseOver(ReactDOM.findDOMNode(tree))
        expect(renderCount).toBe(3)
    })

    it('should only update proxy when event types are added or removed', () => {
        let renderCount = 0
        let clickCount = 0
        let mouseOverCount = 0
        let stage2ClickCount = 0
        class ReceiverComponent extends React.Component {
            state = { stage: 0 }

            handleGlobalClick = (event) => {
                ++clickCount
                if (this.state.stage === 0) {
                    this.setState({ stage: 1 })
                }
            }

            handleGlobalMouseOver = (event) => {
                ++mouseOverCount
                if (this.state.stage === 1) {
                    this.setState({ stage: 2 })
                }
            }

            render() {
                ++renderCount
                return (
                    <ReactHigherEvent
                        onClick={this.handleGlobalClick}
                        onMouseOver={this.state.stage ? this.handleGlobalMouseOver : null}
                    >
                        {this.state.stage === 2 ? (
                            <ReactHigherEvent onClick={() => ++stage2ClickCount}>
                                <div>ok</div>
                            </ReactHigherEvent>
                        ) : (
                            <div>ok</div>
                        )}
                    </ReactHigherEvent>
                )
            }
        }

        class Iframe extends React.Component {
            componentDidMount() {
                const doc = ReactDOM.findDOMNode(this).contentWindow.document
                doc.open()
                doc.write('<!doctype html><html><body><div></div></body></html>')
                doc.close()

                const mountTarget = doc.body.children[0]
                ReactDOM.unstable_renderSubtreeIntoContainer(
                    this,
                    this.props.children,
                    mountTarget,
                )
            }

            render() {
                return <iframe />
            }
        }

        let proxyRef
        let proxyNode
        const proxyStates = []
        class IframeInside extends React.Component {
            handleProxyNode = (ref) => (proxyNode = ref)

            handleProxyRef = (ref) => {
                if (ref) proxyStates.push(ref.state)
                proxyRef = ref
            }

            render() {
                return (
                    <ReactHigherEventProxy
                        ref={this.handleProxyRef}
                        handleRef={this.handleProxyNode}
                    >
                        <div />
                    </ReactHigherEventProxy>
                )
            }
        }

        const mount = document.body.appendChild(document.createElement('div'))
        const tree = ReactDOM.render(
            <ReactHigherEventContainer>
                <div>
                    <Iframe>
                        <IframeInside />
                    </Iframe>
                    <ReceiverComponent />
                </div>
            </ReactHigherEventContainer>,
            mount,
        )

        // Initial render adds onClick handler which triggers additional render
        expect(renderCount).toBe(2)
        // Proxy state should have been updated since mounting from onClick handler
        expect(proxyStates[proxyStates.length - 1]).not.toBe(proxyRef.state)
        proxyStates.push(proxyRef.state)

        TestUtils.Simulate.mouseOver(proxyNode)
        TestUtils.Simulate.click(proxyNode)
        // Click updates state, render adds onMouseOver handler (2 renders)
        expect(renderCount).toBe(4)
        // New event type for eventProps triggers new state
        expect(proxyStates[proxyStates.length - 1]).not.toBe(proxyRef.state)
        proxyStates.push(proxyRef.state)
        expect(clickCount).toBe(1)
        expect(mouseOverCount).toBe(0)

        TestUtils.Simulate.mouseOver(proxyNode)
        // Mouseover updates state, render adds new ReactHigherEvent component
        expect(renderCount).toBe(5)
        // New component adds an onClick handler, which already existed
        // So current state should not have changed
        expect(proxyStates[proxyStates.length - 1]).toBe(proxyRef.state)
        expect(mouseOverCount).toBe(1)
        expect(stage2ClickCount).toBe(0)

        TestUtils.Simulate.click(proxyNode)
        expect(renderCount).toBe(5)
        expect(clickCount).toBe(2)
        expect(stage2ClickCount).toBe(1)

        mount.parentNode.removeChild(mount)
    })
})

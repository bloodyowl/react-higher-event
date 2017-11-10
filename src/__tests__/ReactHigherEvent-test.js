jest
  .disableAutomock()

const React = require("react")
const ReactDOM = require("react-dom")
const TestUtils = require("react-dom/test-utils")
const ReactHigherEventContainer = require("../ReactHigherEventContainer").default
const ReactHigherEventProxy = require("../ReactHigherEventProxy").default
const ReactHigherEvent = require("../ReactHigherEvent").default

describe("ReactHigherEventContainer", () => {

  it("should let components handle higher events", () => {

    class ReceiverComponent extends React.Component {
      constructor(props) {
        super(props)
        this.handleGlobalClick = this.handleGlobalClick.bind(this)
      }
      handleGlobalClick(event) {
        expect(event.target.parentNode.parentNode).toBe(null)
      }
      render() {
        return (
          <ReactHigherEvent
            onClick={this.handleGlobalClick}
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
      </ReactHigherEventContainer>
    )

    TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))

  })

  it("should be able to call multiple subscribers", () => {

    let clickCount = 0
    class ReceiverComponent extends React.Component {
      constructor(props) {
        super(props)
        this.handleGlobalClick = this.handleGlobalClick.bind(this)
      }
      handleGlobalClick(event) {
        ++clickCount
      }
      render() {
        return (
          <ReactHigherEvent
            onClick={this.handleGlobalClick}
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
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    )

    TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
    expect(clickCount).toBe(2)

  })

  it("should be able to unsubscribe", () => {

    class ReceiverComponent extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          clickCount: 0,
        }
        this.handleGlobalClick = this.handleGlobalClick.bind(this)
      }
      handleGlobalClick(event) {
        this.setState({
          clickCount: this.state.clickCount + 1,
        }, () => {
          expect(this.state.clickCount).toBe(1)
        })
      }
      render() {
        return (
          <ReactHigherEvent
            onClick={this.state.clickCount > 0 ? this.handleGlobalClick : undefined}
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
      </ReactHigherEventContainer>
    )

    TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
    TestUtils.Simulate.click(ReactDOM.findDOMNode(tree))

  })

  it("should let components stop propagation to higher events", () => {

    class ReceiverComponent extends React.Component {
      constructor(props) {
        super(props)
        this.handleClick = this.handleClick.bind(this)
        this.handleGlobalClick = this.handleGlobalClick.bind(this)
      }
      handleGlobalClick(event) {
        expect(false).toBe(true)
      }
      handleClick(event) {
        event.stopPropagation()
        expect(event.target).toBe(this.target)
      }
      render() {
        return (
          <ReactHigherEvent
            onClick={this.handleGlobalClick}
          >
            <div
              onClick={this.handleClick}
              ref={(c) => this.target = c}
            >
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
      </ReactHigherEventContainer>
    )

    const receiver = TestUtils.findRenderedComponentWithType(tree, ReceiverComponent)
    const div = TestUtils.findRenderedDOMComponentWithTag(receiver, "div")
    TestUtils.Simulate.click(div)

  })

  it("should let us use other tags for ReactHigherEventContainer", () => {

    const tree = TestUtils.renderIntoDocument(
      <ReactHigherEventContainer component={ "span" }>
        <a></a>
      </ReactHigherEventContainer>
    )

    expect(() => {
      const div = TestUtils.findRenderedDOMComponentWithTag(tree, "div")
    }).toThrow()

    const span = TestUtils.findRenderedDOMComponentWithTag(tree, "span")
    expect(span).toBeTruthy()

  })

  it("should let us use custom component for ReactHigherEventContainer", () => {

    const Compo = (props) => <article>{ props.children }</article>
    const tree = TestUtils.renderIntoDocument(
      <ReactHigherEventContainer component={ Compo }>
        <a></a>
      </ReactHigherEventContainer>
    )

    expect(() => {
      const div = TestUtils.findRenderedDOMComponentWithTag(tree, "div")
    }).toThrow()

    const span = TestUtils.findRenderedDOMComponentWithTag(tree, "article")
    expect(span).toBeTruthy()

  })

  it("should proxy to root container from across an iframe", () => {

    let clickCount = 0

    class Iframe extends React.Component {
      componentDidMount() {
        const doc = ReactDOM.findDOMNode(this).contentWindow.document
        doc.open()
        doc.write("<!doctype html><html><body><div></div></body></html>")
        doc.close()

        const mountTarget = doc.body.children[0]
        ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, mountTarget)
      }
      render() {
        return <iframe />
      }
    }

    class ReceiverComponent extends React.Component {
      constructor(props) {
        super(props)
        this.handleGlobalClick = this.handleGlobalClick.bind(this)
      }
      handleGlobalClick(event) {
        ++clickCount
        expect(event.target.ownerDocument).not.toBe(this.node.ownerDocument)
      }
      render() {
        return (
          <ReactHigherEvent
            onClick={this.handleGlobalClick}
          >
            <div ref={(c) => this.node = c}>outside iframe</div>
          </ReactHigherEvent>
        )
      }
    }

    let innerNode
    class Inner extends React.Component {
      render() {
        return <div ref={(c) => innerNode = c}>inside iframe</div>
      }
    }

    const mount = document.body.appendChild(document.createElement("div"))
    const tree = ReactDOM.render((
      <ReactHigherEventContainer>
        <div>
          <Iframe>
            <ReactHigherEventProxy>
              <Inner />
            </ReactHigherEventProxy>
          </Iframe>
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    ), mount)

    TestUtils.Simulate.click(innerNode)
    expect(clickCount).toBe(1)
    mount.parentNode.removeChild(mount)

  })

})

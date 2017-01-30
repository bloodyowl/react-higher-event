jest
  .disableAutomock()

const React = require("react")
const ReactDOM = require("react-dom")
const ReactHigherEventContainer = require("../ReactHigherEventContainer").default
const ReactHigherEvent = require("../ReactHigherEvent").default
const ReactTestUtils = require("react-addons-test-utils")

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

    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer>
        <div>
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    )

    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(tree))

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

    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer>
        <div>
          <ReceiverComponent />
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    )

    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
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

    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer>
        <div>
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    )

    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(tree))
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(tree))

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

    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer>
        <div>
          <ReceiverComponent />
        </div>
      </ReactHigherEventContainer>
    )

    const receiver = ReactTestUtils.findRenderedComponentWithType(tree, ReceiverComponent)
    const div = ReactTestUtils.findRenderedDOMComponentWithTag(receiver, "div")
    ReactTestUtils.Simulate.click(div)

  })

  it("should let us use other tags for ReactHigherEventContainer", () => {
    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer component={ "span" }>
        <a></a>
      </ReactHigherEventContainer>
    )

    expect(() => {
      const div = ReactTestUtils.findRenderedDOMComponentWithTag(tree, "div")
    }).toThrow()

    const span = ReactTestUtils.findRenderedDOMComponentWithTag(tree, "span")
    expect(span).toBeTruthy()
  })

  it("should let us use custom component for ReactHigherEventContainer", () => {
    const Compo = (props) => <article>{ props.children }</article>
    const tree = ReactTestUtils.renderIntoDocument(
      <ReactHigherEventContainer component={ Compo }>
        <a></a>
      </ReactHigherEventContainer>
    )

    expect(() => {
      const div = ReactTestUtils.findRenderedDOMComponentWithTag(tree, "div")
    }).toThrow()

    const span = ReactTestUtils.findRenderedDOMComponentWithTag(tree, "article")
    expect(span).toBeTruthy()
  })

})

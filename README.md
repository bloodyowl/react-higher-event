# react-higher-event

> Declarative API to listen to events outside of a component

## What issues does it solve?

The React synthetic event system doesn’t interact in the same event loop as
plain DOM events. This means that listeners attached using
`addEventListener` in your lifecycles hooks will not be in the same phase
as the ones you declare using React props.

```javascript
class MyComponent extends React.Component {
    state = { isOpened: false }

    componentDidMount() {
        document.body.addEventListener('click', this.close)
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.close)
    }

    close = () => {
        this.setState({
            isOpened: false,
        })
    }

    open = (event) => {
        event.stopPropagation() // will not stop propagation of native click event to document.body
        this.setState({
            isOpened: true,
        })
    }

    render() {
        return (
            <div>
                <div onClick={this.open}>open</div>
                {this.state.isOpened && <div>{/* some stuff */}</div>}
            </div>
        )
    }
}
```

ReactHigherEvent solves this issue by using the React event system and
making it accessible declaratively anywhere. Just pass your listener as a
prop to `<ReactHigherEvent>`, which you can use as a transparent component
wrapper wherever you want in your component tree, and it will work!

## Install

```console
$ npm install --save react-higher-event
```

## Import

```javascript
// ES5/commonJS
var ReactHigherEvent = require('react-higher-event')
// ES6
import {
    ReactHigherEvent,
    ReactHigherEventProvider,
} from 'react-higher-event'
```

## Usage

### ReactHigherEventProvider

Put this component at the root of your app so that it can listen to events
at the top.

> NOTE: Any props you pass in other than `props.component` will be directly
> applied to the root DOM element, so you can pass in styles or a className
> (e.g. to ensure it covers the whole document)

```javascript
ReactDOM.render(
    <ReactHigherEventProvider className="app-root">
        {/* my components */}
    </ReactHigherEventProvider>,
)
```

This component accepts children, a `component` property so you can replace
the default `<div>` used, and uses
[ref forwarding](https://reactjs.org/docs/forwarding-refs.html) to pass any
ref along to the `ref` prop of the container component that gets rendered.

```javascript
ReactDOM.render(
    <ReactHigherEventProvider
        component={CustomThing}
        ref={handleContainerRef}
    >
        {/* my components */}
    </ReactHigherEventProvider>,
)
```

### ReactHigherEvent

Use this component where you want to listen to higher events:

```javascript
<ReactHigherEvent onClick={this.handleGlobalClick}>
    {/* if you want to avoid triggering the “higher event”, you will want to stopPropagating from your component */}
    <div onClick={(event) => event.stopPropagation()}>hello world</div>
</ReactHigherEvent>
```

# react-higher-event

**Experimental**

> Declarative API to listen to events outside of a component

## Install

```console
$ npm install --save react-higher-event
```

## Import

```javascript
// ES5/commonJS
var ReactHigherEvent = require("react-higher-event")
// ES6
import { ReactHigherEvent, ReactHigherEventContainer } from "react-higher-event"
```

## Usage

### ReactHigherEventContainer

Put this component at the root of your app so that it can listen to events at the top.

> NOTE: You can pass some style/className to ensure it covers the whole document

```javascript
ReactDOM.render(
  <ReactHigherEventContainer>
    {/* my components */}
  </ReactHigherEventContainer>
)
```

### ReactHigherEvent

Use this component where you want to listen to higher events:

```javascript
<ReactHigherEvent
  onClick={this.handleGlobalClick}
>
  <div>
    helloworld
  </div>
</ReactHigherEvent>
```

## TODO

- Tests
- Performance tests (maybe batch `forceUpdate` calls)

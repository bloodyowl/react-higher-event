import { PropTypes } from "react"

const ReactHigherEventProxyContextTypes = {
  higherEventProxy: PropTypes.shape({
    handleEvent: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    events: PropTypes.instanceOf(Map).isRequired,
  }).isRequired,
}

export default ReactHigherEventProxyContextTypes

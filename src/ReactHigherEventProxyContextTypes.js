import PropTypes from "prop-types"

const ReactHigherEventProxyContextTypes = {
  higherEventProxy: PropTypes.shape({
    handleEvent: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    events: PropTypes.instanceOf(Map).isRequired,
  }).isRequired,
}

export default ReactHigherEventProxyContextTypes

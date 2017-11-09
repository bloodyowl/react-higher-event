import PropTypes from "prop-types"

const ReactHigherEventContextTypes = {
  higherEvent: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
  }).isRequired,
}

export default ReactHigherEventContextTypes

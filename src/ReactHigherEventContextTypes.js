import { PropTypes } from "react"

const ReactHigherEventContextTypes = {
  higherEvent: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
  }).isRequired,
}

export default ReactHigherEventContextTypes

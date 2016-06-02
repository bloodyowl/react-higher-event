import "./index.html"

import React from "react"
import ReactDOM from "react-dom"

import ReactHigherEventContainer from "../../src/ReactHigherEventContainer"

import Dropdown from "./Dropdown"

ReactDOM.render(
  <ReactHigherEventContainer
    style={{
      minHeight: "100vh",
      minWidth: "100vw",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Dropdown />
  </ReactHigherEventContainer>,
  document.getElementById("App")
)

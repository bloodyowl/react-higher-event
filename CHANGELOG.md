# 3.0.1 - 2021-09-09

-   Allow passing any number of children to the `ReactHigherEvent`
    component (previously it used `React.Children.only(children)` to
    restrict it to one)

# 3.0.0 - 2021-09-09

## Breaking Changes

-   Refactored from legacy context → modern react context plus hooks,
    making react-higher-events compatible with React v17+ and requiring
    **at least v16.3.0**
-   Renamed `ReactHigherEventContainer` → `ReactHigherEventProvider` to
    match modern react context naming conventions
-   Replaced `ReactHigherEventProvider` and `ReactHigherEventProxy`’s
    `props.handleRef` with ref forwarding (i.e. replace
    `handleRef={refHandler}` → `ref={refHandler}`)

# 1.1.0 - 2017-01-26

-   🍭 Added: `component` property to `ReactHigherEventContainer` so you
    can replace the default `div`

# 1.0.0 - 2016-06-02

⚡️ Initial release

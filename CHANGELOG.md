# 4.0.0 - 2023-07-17

## Breaking Changes

-   Refactored handling of
    [KeyboardEvents](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
    to use
    [@acusti/use-keyboard-events](https://github.com/acusti/uikit/tree/main/packages/use-keyboard-events)
    so that all keyboard events are captured
-   As a result, the event payload passed to `onKeyDown`, `onKeyPress`, and
    `onKeyUp` handlers is now the browser native `KeyboardEvent` object,
    not the React `SyntheticEvent` object
-   Migrated published package from CommonJS → ESM

## Improvements

-   Upgraded dev dependencies to the latest versions of React/ReactDOM
    (18.2.0), @testing-library/react (14.0.0), and babel (7.22.6)
-   Added prettier to dev dependencies and added a `format` run script
-   Migrated the test runner from jest → vitest
-   Migrated to using the @babel/preset-env preset

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

---
title: React/Redux Gotchas
date: 2018-12-28
excerpt: Mistakes I have made
tags: ["tech", "react", "redux", "gotchas"]
---

Over the past two years, I have fallen prey to many gotchas when working with a React / Redux frontend stack. Since some of these were time consuming traps, I wanted to share these in the hope that it may help some people avoid these in the first place.


# Calling an action creator that has not been wrapped in dispatch()

This trap is usually difficult to spot and can manifest itself in a few ways. Typically, you believe you have wired up everything correctly, but something is still wrong or nothing really happens when you try to to trigger the action creator. Let's show two examples of this:


## Example 1

Try to find the issue with this component:

``` jsx
import { patchColumnData, toggleSelectOpen } from "sheets/sheet-action-creators"
export const StafferSelectCell = ({ sheetId, rowId, columnId, … props }) => (
    <Cell>
        onClick={({ person, …staffer }) =>
            patchColumnData(sheetId, columnId, rowId, ...staffer )}
    </Cell>
)
export default connect(null, { patchColumnData, toggleSelectOpen })(StafferSelectCell)
```

We're passing in `{ patchColumnData, toggleSelectOpen }` as the second argument `mapDispatchToProps`. Since we're passing in an object, redux will wrap every action creator into a dispatch call so that it can be invoked directly.
(connect's signature is `connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])`)

Trying to click on `<Cell/>` will not result in an action being dispatch. Why? Instead of calling `patchColumnData` that has had `dispatch()` applied to it (ex. `dispatch(patchColumnData(...))` ),
we are calling the imported `patchColumnData` from the top of the file.

Since we are destructuring most of the `props`, it's very easy to miss this. Here is the corrected snippet:

``` jsx
import { patchColumnData, toggleSelectOpen } from "sheets/sheet-action-creators"
export const StafferSelectCell = ({ sheetId, rowId, columnId, … props }) => (
    <Cell>
        onClick={({ person, …staffer }) =>
            props.patchColumnData(sheetId, columnId, rowId, ...staffer )}
    </Cell>
)
export default connect(null, { patchColumnData, toggleSelectOpen })(StafferSelectCell)
```

I prefer to NOT destructure action creators for two reasons: 1. It throws a linting error that will look something like `"patchColumnData is already declared in the upper scope` and 2. I like to specifically seperate the un-dispatched and dispatched action creators.

## Example 2

Another place where it's easy to forget to dispatch your action creators is when you are calling other action creators in an action creator. Here is an example:

``` javascript
import { patchSheet, patchColumnData } from "..."
// ...
// make a network request to patch the column size
export const patchColumnSize = (id, width, columnId) =>
    (dispatch, getState) => {
        (columnId === sheetConstants.DATUM_COLUMN_INDEX) // eslint-disable-line no-unused-expressions
            ? patchSheet(
                id,
                { datum_column_width: width }
            )
            : patchColumn(id, columnId, { width })
    }
```

In this action creator, we are calling one of two additional creators `patchSheet` and `patchColumn`. To facilitate this use case, we are provided `dispatch` as an argument to the `thunk` that `patchColumnSize` returns (read more about redux thunk [here](https://github.com/reduxjs/redux-thunk)). We need to wrap every action creator (unless it already has `dispatch()` applied to it, in which case applying `dispatch()` once more is noop) with `dispatch()` so that we correctly fire off the Redux action.


Here is the correct snippet:

``` javascript
import { patchSheet, patchColumnData } from "..."
// ...
// make a network request to patch the column size
export const patchColumnSize = (id, width, columnId) =>
    (dispatch, getState) => {
        (columnId === sheetConstants.DATUM_COLUMN_INDEX) // eslint-disable-line no-unused-expressions
            ? dispatch(patchSheet(
                id,
                { datum_column_width: width }
            ))
            : dispatch(patchColumn(id, columnId, { width }))
    }
```

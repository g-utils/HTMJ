# HTMJ Framework Documentation

HTMX but JSON

> [!WARNING]  
> Don't actually use this! I am not a JavaScript programmer and this code cannot be expected to run reliably.

## Overview

The HTMJ framework is a lightweight JavaScript library designed to simplify the process of fetching data from an API endpoint and rendering it on a webpage using HTML templates.

## Getting Started

### Basic HTML Template

To use the HTMJ framework, define a `<template>` tag with an `hx-endpoint` attribute pointing to the API endpoint.

```html
<template hx-endpoint="/api/data">
  <div>${data}</div>
</template>
```

## Attributes

The HTMJ framework uses custom attributes to control its behavior:

### `hx-endpoint`

Specifies the URL of the API endpoint to fetch data from.

```html
<template hx-endpoint="/api/data"></template>
```

### `hx-data-sources`

Defines the elements whose data should be sent to the API. Elements should be specified using a comma-separated list of CSS selectors.

```html
<template hx-endpoint="/api/data" hx-data-sources="#input1, #input2"></template>
```

### `hx-method`

Specifies the HTTP method to use when fetching data. If omitted, it defaults to `GET` if there are no data sources, or `POST` if there are.

```html
<template hx-endpoint="/api/data" hx-method="POST"></template>
```

### `hx-event`

Specifies the event that triggers the data fetch. Defaults to `onload`. Possible values are `onload`, `onclick`, `onsubmit`, etc.

```html
<template hx-endpoint="/api/data" hx-event="onclick"></template>
```

### `hx-error`

Specifies a global function to call if an error occurs during the data fetch.

```html
<template hx-endpoint="/api/data" hx-error="handleError"></template>
```

### `hx-target`

Defines the CSS selector of the element where the rendered content should be placed. If omitted, defaults to the parent node of the template.

```html
<template hx-endpoint="/api/data" hx-target="#outputDiv"></template>
```

### `hx-event-target`

Specifies the CSS selector of the element that the event listener should be attached to. If omitted, defaults to the target element.

```html
<template
  hx-endpoint="/api/data"
  hx-event="onclick"
  hx-event-target="#button"
></template>
```

### `hx-action`

Defines the action to perform on the target element. Possible values are `append`, `swap`, and `update`. Defaults to `update`.

```html
<template hx-endpoint="/api/data" hx-action="append"></template>
```

### `data-nested-array`

Used to denote elements that should be populated with nested array data.

```html
<div data-nested-array="nestedData">
  <p>${item}</p>
</div>
```

## Nested Arrays

The HTMJ framework supports nested arrays in the JSON data. The `data-nested-array` attribute is used to specify which elements correspond to nested arrays in the JSON data.

## Example Usage

Given a JSON response like:

```json
{
  "row1": { "name": "Main row" },
  "row2": [{ "item": "Nested item 1" }, { "item": "Nested item 2" }]
}
```

The following template will render the data correctly:

```html
<template hx-endpoint="api/endpoint">
  <div class="row">
    <span>${row1.name}</span>
    <div data-nested-array="row2">
      <p>${item}</p>
    </div>
  </div>
</template>
```

## Conclusion

The HTMJ framework is a powerful yet simple library that enables developers to dynamically fetch and render data on web pages using HTML templates and custom attributes.

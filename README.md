# Chakrathon Select

Submission for the 2022 Chakrathon (Final Round).

# Overview

Select component is a component that allows users pick a value from predefined options. Ideally, it should be used when there are more than 5 options, otherwise you might consider using a radio group instead.

## Imports

```javascript
import { Select } from "@chakra-ui/react";
```

# Usage

In this repository, we offer two ways to create a customized select component: 1) the `useSelect` hook, 2) the `<Select/>` component.

## `<Select/>` component

The `<Select/>` component offers a general select component with accessibility and Typeahead support.

You can build a select element using the following components provided by `chakrathon-select`:

- `<Select/>`
- `<SelectOption/>`
  For more details on the properties, skip to the [props](#props) section.

### Example usage

```javascript
<Select placeholder="Select an option">
  <SelectOption value="1">Option 1</SelectOption>
  <SelectOption value="2">Option 2</SelectOption>
  <SelectOption value="3">Option 3</SelectOption>
  <SelectOption value="4">Option 4</SelectOption>
</Select>
```

## `useSelect` hook

When the developer wants more customizability over their components, the `useSelect` hook can be used.

The hook offers 4 key returns:

- `state`: current state of the select
- `getButtonProps`: props for the select button
- `getMenuProps`: function that returns props for the menu (containing options)
- `getOptionProps`: function that returns props for each custom select option

### Example usage

```javascript
<Box>
  <Box {...getButtonProps} bgColor="grey">
    {state.value === "" ? "Press to select!" : state.value}
  </Box>
  {state.isOpen ? (
    <VStack align="start" py={2} {...getMenuProps()}>
      <Button {...getOptionProps({ value: "one" })}>Option 1</Button>
      <Button {...getOptionProps({ value: "two" })}>Option 2</Button>
      <Button {...getOptionProps({ value: "three" })}>Option 3</Button>
    </VStack>
  ) : null}
</Box>
```

## Complete Example
```javascript
import {
  Box,
  Button,
  Stack,
  Text,
  VStack,
  FormControl,
} from "@chakra-ui/react";
import { Select, SelectOption, useSelect } from "@chakrathon-select";

function handleSubmit(e: any) {
  e.preventDefault();
  console.log(e.target[0].value);
}

function Form() {
  const { state, getButtonProps, getOptionProps, getMenuProps } = useSelect();

  return (
    <Stack spacing={4} p={16}>
      <Text>Custom Select (Component)</Text>
      <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
      </Select>
      <Text>Custom useSelect (Hook)</Text>
      <Box>
        <Box {...getButtonProps} bgColor="grey">
          {state.value === "" ? "Press to select!" : state.value}
        </Box>
        {state.isOpen ? (
          <VStack align="start" py={2} {...getMenuProps()}>
            <Button {...getOptionProps({ value: "one" })}>Option 1</Button>
            <Button {...getOptionProps({ value: "two" })}>Option 2</Button>
            <Button {...getOptionProps({ value: "three" })}>Option 3</Button>
          </VStack>
        ) : null}
      </Box>
    </Stack>
  );
}

export default Form;
```

# Form Support
Chakrathon-select now is compatible with chakra forms and regular HTML forms. This is handled automatically in the select component, and can be added using the `addValueToForm()` function for the hook.

# Customization
For full customization, we recommend developers to use our `useSelect` hook.

However, our `<Select/>` component does offer benefits such as Typeahead and keyboard support for selecting an option.

To further customize the component, we support all base chakra component properities, including padding, margins, etc.

## Variants
- `outline` (default)
- `filled`
- `unstyled`
- `saitama`

# <a name="props"></a> Prop Table

## `<Select/>`
### `placeholder` (optional)

The placeholder value. Default is "Select".

### `closeOnSelect` (optional)
If `true`, the select dropdown will close when an option was chosen.

Default is `true`.

### `closeOnSelect` (optional)

If `true`, the select will close when you click outside the select list.

Default is `true`.

## `<SelectOption/>`

### `value` (optional)

The inner value for the select option. This is set to the children of select by default.

### `setSelectedValue` (optional)

A function to override the logic for setting the selected value.

### `handleKeyPress` (optional)

A function to be called when a key is pressed

### `handleClick` (optional)

A function to override the logic for when the select option is clicked.

Default behavior: when a `SelectOption` is clicked, the value of the selected item of the parent `Select` is set to the value of the current `SelectOption`.

# Chakrathon Select
Submission for the 2022 Chakrathon (Final Round).

# Prop Table
## Select
### `placeholder` (optional)
The placeholder value. Default is "Select".

## SelectOption
### `value` (optional)
The value of the select option. This is set to the children of select by default.

### `setSelectedValue` (optional)
TODO: What the heck is this???

### `handleClick` (optional)
Customize behavior for clicking on a select option.

Default behavior: when a `SelectOption` is clicked, the value of the selected item of the parent `Select` is set to the value of the current `SelectOption`.


interface SelectOptionProps extends BoxProps {
  value?: string;
  setSelectedValue?: (value: string | null) => void | undefined;
  handleClick?: (value: string) => void;
}
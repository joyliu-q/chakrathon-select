import { UseSelectItemProps, useSelectItem } from "./useSelectItem"

/* -------------------------------------------------------------------------------------------------
 * useSelectOption: Composes useSelectItem to provide a selectable/checkable select item
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectOptionOptions {
  value?: string
  isChecked?: boolean
  type?: "radio" | "checkbox"
  children?: React.ReactNode
}

export interface UseSelectOptionProps
  extends Omit<UseSelectItemProps, "type">,
    UseSelectOptionOptions {}

export function useSelectOption(
  props: UseSelectOptionProps = {},
  ref: React.Ref<any> = null,
) {
  const { type = "radio", isChecked, ...rest } = props
  const ownProps = useSelectItem(rest, ref)
  return {
    ...ownProps,
    role: `selectitem${type}`,
    "aria-checked": isChecked as React.AriaAttributes["aria-checked"],
  }
}
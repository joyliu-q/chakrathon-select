import {
  useDisclosure,
  useIds,
} from "@chakra-ui/hooks"
import {
  createContext,
} from "@chakra-ui/react-utils"
import * as React from "react"

/* -------------------------------------------------------------------------------------------------
 * Create context to track select state and logic
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectReturn extends ReturnType<typeof useSelect> { }

export const [SelectProvider, useSelectContext] = createContext<
  Omit<UseSelectReturn, "descendants">
>({
  strict: false,
  name: "SelectContext",
})

/* -------------------------------------------------------------------------------------------------
 * useSelect hook
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectProps {
  /**
   * If `true`, the select will close when a select item is
   * clicked
   *
   * @default true
   */
  closeOnSelect?: boolean
  /**
   * If `true`, the select will close when you click outside
   * the select list
   *
   * @default true
   */
  closeOnBlur?: boolean
}

/**
 * React Hook to manage a select
 *
 * It provides the logic and will be used with react context
 * to propagate its return value to all children
 */
export function useSelect(props: UseSelectProps = {}) {
  const {
    closeOnSelect = true,
    closeOnBlur = true,
  } = props
  /**
   * Prepare the reference to the select and disclosure
   */
  const selectRef = React.useRef<HTMLDivElement>(null)
  const selectButtonRef = React.useRef<HTMLButtonElement>(null)
  const selectMenuRef = React.useRef<HTMLDivElement>(null) // TODO: given selectRef, figure out which ones are the select options

  /**
   * Whether the select is open or not
   */
  const [isOpen, setIsOpen] = React.useState(false);

  /**
   * The value of the selected option item
   */
  const [value, setValue] = React.useState(null as string | null);

  const onOpen = () => {
    setIsOpen(true);
  }
  const onClose = () => {
    setIsOpen(false);
  }
  const onToggle = () => {
    setIsOpen(!isOpen);
  }

  // IM SORRY LOL I used type any again
  const onClickOption = (e: any) => {
    if (closeOnSelect) {
      onClose();
    }
    setValue(e.target.value);
  }

  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  /**
   * Generate unique ids for select's list and button
   */
  const [buttonId, selectId] = useIds(`select-button`, `select-list`)

  return {
    value,
    buttonId,
    selectId,
    isOpen,
    onToggle,
    onOpen,
    onClose,
    onClickOption,
    selectRef,
    selectButtonRef,
    selectMenuRef,
    focusedIndex,
    closeOnSelect,
    closeOnBlur,
    setFocusedIndex,
  }
}
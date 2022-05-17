import { createDescendantContext } from "@chakra-ui/descendant"
import {
  useDisclosure,
  useFocusOnHide,
  useIds,
  useOutsideClick,
  useUnmountEffect,
  useUpdateEffect,
} from "@chakra-ui/hooks"
import {
  createContext,
} from "@chakra-ui/react-utils"
import {
  focus,
} from "@chakra-ui/utils"
import * as React from "react"

/* -------------------------------------------------------------------------------------------------
 * Create context to track descendants and their indices
 * -----------------------------------------------------------------------------------------------*/

export const [
  SelectDescendantsProvider,
  useSelectDescendantsContext,
  useSelectDescendants,
  useSelectDescendant,
] = createDescendantContext<HTMLElement>()

/* -------------------------------------------------------------------------------------------------
 * Create context to track select state and logic
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectReturn extends ReturnType<typeof useSelect> {}

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
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  /**
   * Context to register all select item nodes
   */
  const descendants = useSelectDescendants()

  const focusSelect = React.useCallback(() => {
    focus(selectRef.current, {
      nextTick: true,
      selectTextIfInput: false,
    })
  }, [])

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    isOpen: true, // TODO: give an option to toggle in future?
  })

  useOutsideClick({
    enabled: isOpen && closeOnBlur,
    ref: selectRef,
    handler: (event) => {
      if (!buttonRef.current?.contains(event.target as HTMLElement)) {
        onClose()
      }
    },
  })

  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  /**
   * Focus the button when we close the select
   */
  useUpdateEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  useFocusOnHide(selectRef, {
    focusRef: buttonRef,
    visible: isOpen,
    shouldFocus: true,
  })

  /**
   * Generate unique ids for select's list and button
   */
  const [buttonId, selectId] = useIds(`select-button`, `select-list`)

  const openAndFocusSelect = React.useCallback(() => {
    onOpen()
    focusSelect()
  }, [onOpen, focusSelect])

  const timeoutIds = React.useRef<Set<any>>(new Set([]))

  useUnmountEffect(() => {
    timeoutIds.current.forEach((id) => clearTimeout(id))
    timeoutIds.current.clear()
  })

  return {
    openAndFocusSelect,
    descendants,
    buttonId,
    selectId,
    isOpen,
    onToggle,
    onOpen,
    onClose,
    selectRef,
    buttonRef,
    focusedIndex,
    closeOnSelect,
    closeOnBlur,
    setFocusedIndex,
  }
}
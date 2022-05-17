import { createDescendantContext } from "@chakra-ui/descendant"
import {
  useDisclosure,
  UseDisclosureProps,
  useFocusOnHide,
  useIds,
  useOutsideClick,
  useShortcut,
  useUnmountEffect,
  useUpdateEffect,
} from "@chakra-ui/hooks"
import { usePopper, UsePopperProps } from "@chakra-ui/popper"
import {
  createContext,
  EventKeyMap,
  mergeRefs,
} from "@chakra-ui/react-utils"
import {
  callAllHandlers,
  dataAttr,
  determineLazyBehavior,
  focus,
  getNextItemFromSearch,
  normalizeEventKey,
} from "@chakra-ui/utils"
import * as React from "react"
import { isTargetSelectItem } from "./use-select-item"

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
 * useSelectState: whether select is open or not
 * -----------------------------------------------------------------------------------------------*/

export function useSelectState() {
  const { isOpen, onClose } = useSelectContext()
  return { isOpen, onClose }
}

/* -------------------------------------------------------------------------------------------------
 * useSelect hook
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectProps
  extends Omit<UsePopperProps, "enabled">,
    UseDisclosureProps {
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
    id,
    closeOnSelect = true,
    closeOnBlur = true,
    isOpen: isOpenProp,
    defaultIsOpen,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    placement = "bottom-start",
    ...popperProps
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

  const onOpenInternal = React.useCallback(() => {
    onOpenProp?.()
    focusSelect()
  }, [focusSelect, onOpenProp])

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    isOpen: isOpenProp,
    defaultIsOpen,
    onClose: onCloseProp,
    onOpen: onOpenInternal,
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

  /**
   * Add some popper.js for dynamic positioning
   */
  const popper = usePopper({
    ...popperProps,
    enabled: isOpen,
    placement,
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
  const [buttonId, selectId] = useIds(id, `select-button`, `select-list`)

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
    popper,
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

/* -------------------------------------------------------------------------------------------------
 * useSelectButton hook
 * -----------------------------------------------------------------------------------------------*/
export interface UseSelectButtonProps
  extends Omit<React.HTMLAttributes<Element>, "color"> {}

/**
 * React Hook to manage a select button.
 *
 * The assumption here is that the `useSelect` hook is used
 * in a component higher up the tree, and its return value
 * is passed as `context` to this hook.
 */
export function useSelectButton(
  props: UseSelectButtonProps = {},
  externalRef: React.Ref<any> = null,
) {
  const select = useSelectContext()
  const { onToggle, popper } = select

  return {
    ...props,
    ref: mergeRefs(select.buttonRef, externalRef, popper.referenceRef),
    id: select.buttonId,
    "data-active": dataAttr(select.isOpen),
    "aria-expanded": select.isOpen,
    "aria-haspopup": "select" as React.AriaAttributes["aria-haspopup"],
    "aria-controls": select.selectId,
    onClick: callAllHandlers(props.onClick, onToggle),
  }
}

/* -------------------------------------------------------------------------------------------------
 * useSelectList
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectListProps
  extends Omit<React.HTMLAttributes<Element>, "color"> {}

/**
 * React Hook to manage a select list.
 *
 * The assumption here is that the `useSelect` hook is used
 * in a component higher up the tree, and its return value
 * is passed as `context` to this hook.
 */
export function useSelectList(
  props: UseSelectListProps = {},
  ref: React.Ref<any> = null,
) {
  const select = useSelectContext()

  if (!select) {
    throw new Error(
      `useSelectContext: context is undefined. Seems you forgot to wrap component within <Select>`,
    )
  }

  const {
    focusedIndex,
    setFocusedIndex,
    selectRef,
    isOpen,
    onClose,
    selectId,
  } = select

  const descendants = useSelectDescendantsContext()

  /**
   * Hook that creates a keydown event handler that listens
   * to printable keyboard character press
   */
  const createTypeaheadHandler = useShortcut({
    preventDefault: (event) =>
      event.key !== " " && isTargetSelectItem(event.target),
  })

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const eventKey = normalizeEventKey(event)

      const keyMap: EventKeyMap = {
        Tab: (event) => event.preventDefault(),
        Escape: onClose,
        ArrowDown: () => {
          const next = descendants.nextEnabled(focusedIndex)
          if (next) setFocusedIndex(next.index)
        },
        ArrowUp: () => {
          const prev = descendants.prevEnabled(focusedIndex)
          if (prev) setFocusedIndex(prev.index)
        },
      }

      const fn = keyMap[eventKey]

      if (fn) {
        event.preventDefault()
        fn(event)
        return
      }

      /**
       * Typeahead: Based on current character pressed,
       * find the next item to be selected
       */
      const onTypeahead = createTypeaheadHandler((character) => {
        const nextItem = getNextItemFromSearch(
          descendants.values(),
          character,
          (item) => item?.node?.textContent ?? "",
          descendants.item(focusedIndex),
        )
        if (nextItem) {
          const index = descendants.indexOf(nextItem.node)
          setFocusedIndex(index)
        }
      })

      if (isTargetSelectItem(event.target)) {
        onTypeahead(event)
      }
    },
    [
      descendants,
      focusedIndex,
      createTypeaheadHandler,
      onClose,
      setFocusedIndex,
    ],
  )

  const hasBeenOpened = React.useRef(false)
  if (isOpen) {
    hasBeenOpened.current = true
  }

  const shouldRenderChildren = determineLazyBehavior({
    hasBeenSelected: hasBeenOpened.current,
  })

  return {
    ...props,
    ref: mergeRefs(selectRef, ref),
    children: shouldRenderChildren ? props.children : null,
    tabIndex: -1,
    role: "select",
    id: selectId,
    style: {
      ...props.style,
      transformOrigin: "var(--popper-transform-origin)",
    },
    "aria-orientation": "vertical" as React.AriaAttributes["aria-orientation"],
    onKeyDown: callAllHandlers(props.onKeyDown, onKeyDown),
  }
}

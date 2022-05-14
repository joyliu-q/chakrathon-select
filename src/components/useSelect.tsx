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
import { useAnimationState } from "@chakra-ui/hooks/use-animation-state"
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
  getOwnerDocument,
  LazyBehavior,
  normalizeEventKey,
} from "@chakra-ui/utils"
import * as React from "react"
import { isTargetSelectItem } from "./useSelectItem"

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

export const [SelectProvider, useSelectContext] = createContext<
  Omit<UseSelectReturn, "descendants">
>({
  strict: false,
  name: "SelectContext",
})

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
  /**
   * If `true`, the first enabled select item will receive focus and be selected
   * when the select opens.
   *
   * @default true
   */
  autoSelect?: boolean
  /**
   * Performance 🚀:
   * If `true`, the SelectItem rendering will be deferred
   * until the select is open.
   */
  isLazy?: boolean
  /**
   * Performance 🚀:
   * The lazy behavior of select's content when not visible.
   * Only works when `isLazy={true}`
   *
   * - "unmount": The select's content is always unmounted when not open.
   * - "keepMounted": The select's content initially unmounted,
   * but stays mounted when select is open.
   *
   * @default "unmount"
   */
  lazyBehavior?: LazyBehavior
  /**
   * If `rtl`, poper placement positions will be flipped i.e. 'top-right' will
   * become 'top-left' and vice-verse
   */
  direction?: "ltr" | "rtl"
  /*
   * If `true`, the select will be positioned when it mounts
   * (even if it's not open).
   *
   * Note 🚨: We don't recommend using this in a select/popover intensive UI or page
   * as it might affect scrolling performance.
   */
  computePositionOnMount?: boolean
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
    autoSelect = true,
    isLazy,
    isOpen: isOpenProp,
    defaultIsOpen,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    placement = "bottom-start",
    lazyBehavior = "unmount",
    direction,
    computePositionOnMount = false,
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

  const focusFirstItem = React.useCallback(() => {
    const id = setTimeout(() => {
      const first = descendants.firstEnabled()
      if (first) setFocusedIndex(first.index)
    })
    timeoutIds.current.add(id)
  }, [descendants])

  const focusLastItem = React.useCallback(() => {
    const id = setTimeout(() => {
      const last = descendants.lastEnabled()
      if (last) setFocusedIndex(last.index)
    })
    timeoutIds.current.add(id)
  }, [descendants])

  const onOpenInternal = React.useCallback(() => {
    onOpenProp?.()
    if (autoSelect) {
      focusFirstItem()
    } else {
      focusSelect()
    }
  }, [autoSelect, focusFirstItem, focusSelect, onOpenProp])

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
    enabled: isOpen || computePositionOnMount,
    placement,
    direction,
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

  const animationState = useAnimationState({ isOpen, ref: selectRef })

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

  const openAndFocusFirstItem = React.useCallback(() => {
    onOpen()
    focusFirstItem()
  }, [focusFirstItem, onOpen])

  const openAndFocusLastItem = React.useCallback(() => {
    onOpen()
    focusLastItem()
  }, [onOpen, focusLastItem])

  const refocus = React.useCallback(() => {
    const doc = getOwnerDocument(selectRef.current)
    const hasFocusWithin = selectRef.current?.contains(doc.activeElement)
    const shouldRefocus = isOpen && !hasFocusWithin

    if (!shouldRefocus) return

    const node = descendants.item(focusedIndex)?.node
    if (node) {
      focus(node, { selectTextIfInput: false, preventScroll: false })
    }
  }, [isOpen, focusedIndex, descendants])

  return {
    openAndFocusSelect,
    openAndFocusFirstItem,
    openAndFocusLastItem,
    onTransitionEnd: refocus,
    unstable__animationState: animationState,
    descendants,
    popper,
    buttonId,
    selectId,
    forceUpdate: popper.forceUpdate,
    orientation: "vertical",
    isOpen,
    onToggle,
    onOpen,
    onClose,
    selectRef,
    buttonRef,
    focusedIndex,
    closeOnSelect,
    closeOnBlur,
    autoSelect,
    setFocusedIndex,
    isLazy,
    lazyBehavior,
  }
}

export interface UseSelectReturn extends ReturnType<typeof useSelect> {}

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

  const { onToggle, popper, openAndFocusFirstItem, openAndFocusLastItem } = select

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const eventKey = normalizeEventKey(event)
      const keyMap: EventKeyMap = {
        Enter: openAndFocusFirstItem,
        ArrowDown: openAndFocusFirstItem,
        ArrowUp: openAndFocusLastItem,
      }

      const action = keyMap[eventKey]

      if (action) {
        event.preventDefault()
        event.stopPropagation()
        action(event)
      }
    },
    [openAndFocusFirstItem, openAndFocusLastItem],
  )

  return {
    ...props,
    ref: mergeRefs(select.buttonRef, externalRef, popper.referenceRef),
    id: select.buttonId,
    "data-active": dataAttr(select.isOpen),
    "aria-expanded": select.isOpen,
    "aria-haspopup": "select" as React.AriaAttributes["aria-haspopup"],
    "aria-controls": select.selectId,
    onClick: callAllHandlers(props.onClick, onToggle),
    onKeyDown: callAllHandlers(props.onKeyDown, onKeyDown),
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
    isLazy,
    lazyBehavior,
    unstable__animationState: animated,
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
    isLazy,
    lazyBehavior,
    isSelected: animated.present,
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

/* -------------------------------------------------------------------------------------------------
 * useSelectPosition: Composes usePopper to position the select
 * -----------------------------------------------------------------------------------------------*/

export function useSelectPositioner(props: any = {}) {
  const { popper, isOpen } = useSelectContext()
  return popper.getPopperProps({
    ...props,
    style: {
      visibility: isOpen ? "visible" : "hidden",
      ...props.style,
    },
  })
}

export function useSelectState() {
  const { isOpen, onClose } = useSelectContext()
  return { isOpen, onClose }
}
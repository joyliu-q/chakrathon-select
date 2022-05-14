import { useClickable } from "@chakra-ui/clickable"
import { createDescendantContext } from "@chakra-ui/descendant"
import {
  useControllableState,
  useDisclosure,
  UseDisclosureProps,
  useFocusOnHide,
  useId,
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
  getValidChildren,
  mergeRefs,
} from "@chakra-ui/react-utils"
import {
  addItem,
  callAllHandlers,
  dataAttr,
  determineLazyBehavior,
  focus,
  getNextItemFromSearch,
  getOwnerDocument,
  isActiveElement,
  isArray,
  isHTMLElement,
  isString,
  LazyBehavior,
  normalizeEventKey,
  removeItem,
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

function isTargetSelectItem(target: EventTarget | null) {
  // this will catch `selectitem`, `selectitemradio`, `selectitemcheckbox`
  return (
    isHTMLElement(target) &&
    !!target.getAttribute("role")?.startsWith("selectitem")
  )
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

/* -------------------------------------------------------------------------------------------------
 * useSelectItem: Hook for each select item within the select list.
   We also use it in `useSelectItemOption`
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectItemProps
  extends Omit<React.HTMLAttributes<Element>, "color" | "disabled"> {
  /**
   * If `true`, the selectitem will be disabled
   */
  isDisabled?: boolean
  /**
   * If `true` and the selectitem is disabled, it'll
   * remain keyboard-focusable
   */
  isFocusable?: boolean
  /**
   * Overrides the parent select's `closeOnSelect` prop.
   */
  closeOnSelect?: boolean
  /**
   * The type of the selectitem.
   */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"]
}

export function useSelectItem(
  props: UseSelectItemProps = {},
  externalRef: React.Ref<any> = null,
) {
  const {
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
    onClick: onClickProp,
    isDisabled,
    isFocusable,
    closeOnSelect,
    type: typeProp,
    ...htmlProps
  } = props

  const select = useSelectContext()

  const {
    setFocusedIndex,
    focusedIndex,
    closeOnSelect: selectCloseOnSelect,
    onClose,
    selectRef,
    isOpen,
    selectId,
  } = select

  const ref = React.useRef<HTMLDivElement>(null)
  const id = `${selectId}-selectitem-${useId()}`

  /**
   * Register the selectitem's node into the domContext
   */
  const { index, register } = useSelectDescendant({
    disabled: isDisabled && !isFocusable,
  })

  const onMouseEnter = React.useCallback(
    (event: any) => {
      onMouseEnterProp?.(event)
      if (isDisabled) return
      setFocusedIndex(index)
    },
    [setFocusedIndex, index, isDisabled, onMouseEnterProp],
  )

  const onMouseMove = React.useCallback(
    (event: any) => {
      onMouseMoveProp?.(event)
      if (ref.current && !isActiveElement(ref.current)) {
        onMouseEnter(event)
      }
    },
    [onMouseEnter, onMouseMoveProp],
  )

  const onMouseLeave = React.useCallback(
    (event: any) => {
      onMouseLeaveProp?.(event)
      if (isDisabled) return
      setFocusedIndex(-1)
    },
    [setFocusedIndex, isDisabled, onMouseLeaveProp],
  )

  const onClick = React.useCallback(
    (event: React.MouseEvent) => {
      onClickProp?.(event)
      if (!isTargetSelectItem(event.currentTarget)) return
      /**
       * Close select and parent selects, allowing the SelectItem
       * to override its parent select's `closeOnSelect` prop.
       */
      if (closeOnSelect ?? selectCloseOnSelect) {
        onClose()
      }
    },
    [onClose, onClickProp, selectCloseOnSelect, closeOnSelect],
  )

  const isFocused = index === focusedIndex

  const trulyDisabled = isDisabled && !isFocusable

  useUpdateEffect(() => {
    if (!isOpen) return
    if (isFocused && !trulyDisabled && ref.current) {
      focus(ref.current, {
        nextTick: true,
        selectTextIfInput: false,
        preventScroll: false,
      })
    } else if (selectRef.current && !isActiveElement(selectRef.current)) {
      focus(selectRef.current, { preventScroll: false })
    }
  }, [isFocused, trulyDisabled, selectRef, isOpen])

  const clickableProps = useClickable({
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    ref: mergeRefs(register, ref, externalRef),
    isDisabled,
    isFocusable,
  })

  return {
    ...htmlProps,
    ...clickableProps,
    type: typeProp ?? (clickableProps as any).type,
    id,
    role: "selectitem",
    tabIndex: isFocused ? 0 : -1,
  }
}

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

/* -------------------------------------------------------------------------------------------------
 * useSelectOptionGroup: Manages the state of multiple selectable selectitem or select option
 * -----------------------------------------------------------------------------------------------*/

export interface UseSelectOptionGroupProps {
  value?: string | string[]
  defaultValue?: string | string[]
  type?: "radio" | "checkbox"
  onChange?: (value: string | string[]) => void
  children?: React.ReactNode
}

export function useSelectOptionGroup(props: UseSelectOptionGroupProps = {}) {
  const {
    children,
    type = "radio",
    value: valueProp,
    defaultValue,
    onChange: onChangeProp,
    ...htmlProps
  } = props

  const isRadio = type === "radio"

  const fallback = isRadio ? "" : []

  const [value, setValue] = useControllableState({
    defaultValue: defaultValue ?? fallback,
    value: valueProp,
    onChange: onChangeProp,
  })

  const onChange = React.useCallback(
    (selectedValue: string) => {
      if (type === "radio" && isString(value)) {
        setValue(selectedValue)
      }

      if (type === "checkbox" && isArray(value)) {
        const nextValue = value.includes(selectedValue)
          ? removeItem(value, selectedValue)
          : addItem(value, selectedValue)

        setValue(nextValue)
      }
    },
    [value, setValue, type],
  )

  const validChildren = getValidChildren(children)

  const clones = validChildren.map((child) => {
    /**
     * We've added an internal `id` to each `SelectItemOption`,
     * let's use that for type-checking.
     *
     * We can't rely on displayName or the element's type since
     * they can be changed by the user.
     */
    if ((child.type as any).id !== "SelectItemOption") return child

    const onClick = (event: MouseEvent) => {
      onChange(child.props.value)
      child.props.onClick?.(event)
    }

    const isChecked =
      type === "radio"
        ? child.props.value === value
        : value.includes(child.props.value)

    return React.cloneElement(child, {
      type,
      onClick,
      isChecked,
    })
  })

  return {
    ...htmlProps,
    children: clones,
  }
}

export function useSelectState() {
  const { isOpen, onClose } = useSelectContext()
  return { isOpen, onClose }
}
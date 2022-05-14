import { useSelectContext, useSelectDescendant } from "./use-select"
import React from "react"
import { useClickable } from "@chakra-ui/clickable"
import {
  useId,
  useUpdateEffect,
} from "@chakra-ui/hooks"
import {
  mergeRefs,
} from "@chakra-ui/react-utils"
import {
  focus,
  isActiveElement,
  isHTMLElement,
} from "@chakra-ui/utils"

export function isTargetSelectItem(target: EventTarget | null) {
  // this will catch `selectitem`, `selectitemradio`, `selectitemcheckbox`
  return (
    isHTMLElement(target) &&
    !!target.getAttribute("role")?.startsWith("selectitem")
  )
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
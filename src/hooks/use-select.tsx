import { useIds } from "@chakra-ui/hooks";
import * as React from "react";
import { GetSelectMenuOptions, UseSelectReturn } from "../type";

enum SelectActionKind {
  OPTION = "option",
  OPTION_TYPED = "option_type",
}

interface SelectAction {
  type: SelectActionKind;
  payload: {
    value: string;
    label: string;
  };
}

interface SelectState {
  label: string;
  value: string;
}

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
  closeOnSelect?: boolean;
  /**
   * If `true`, the select will close when you click outside
   * the select list
   *
   * @default true
   */
  closeOnBlur?: boolean;
  /**
   * placeholder to display when no value is selected
   */
  placeholder?: string;
}

/**
 * React Hook to manage a select
 *
 * It provides the logic and will be used with react context
 * to propagate its return value to all children
 */
export function useSelect(props: UseSelectProps = {}): UseSelectReturn {
  const {
    closeOnSelect = true,
    closeOnBlur = true,
    placeholder = "Select an option",
  } = props;

  /**
   * Whether the select is open or not
   */
  const [isOpen, setIsOpen] = React.useState(false);

  /**
   * Typeahead: the current text being searched
   */

  function reducer(_state: SelectState, action: SelectAction) {
    const {
      type,
      payload: { value, label },
    } = action;

    switch (type) {
      case SelectActionKind.OPTION:
        return { value, label };
      case SelectActionKind.OPTION_TYPED:
        return { value, label };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = React.useReducer(reducer, {
    label: placeholder,
    value: "",
  });

  const onClose = () => {
    setIsOpen(false);
  };
  const onToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
    }
  };

  /**
   * Generate unique ids for select's list and button
   */
  const [buttonId,] = useIds(`select-button`);
  // NOTE: mutability introduced here in order to reassign ref if a different ref was passed in
  // NOTE: there may be multiple elements that gets their ref generated
  // in that case, when MULTIPLE selects are open at the same time, it might be a little confused on what
  // the ref is
  // but even in that case, it would just take the most recent ref and do typeahead for that
  // in most use cases, we don't particularly care for closing ALL of the select menus
  // but if this feature were to be included in the future, we would keep track of a SET of refs that gets
  // updated whenever we call the function getMenuProps.
  let selectMenuRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      // If closeOnBlur is false, we don't close when clicked outside


      if (!closeOnBlur) {
        return;
      }
      if (
        selectMenuRef.current &&
        !selectMenuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [selectMenuRef, closeOnBlur]
  );

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectMenuRef, isOpen, handleClickOutside]);



  const getOptionProps = ({ value }: { value: string }) => {

    const makeRandomId = () => {
      return Math.random().toString(36).substring(5);
    }

    const optionId = `option-${value}-${makeRandomId()}`;

    return {
      id: optionId,
      value,
      onClick: (_: React.MouseEvent) => {
        const element = document.getElementById(optionId);
        console.log(element);
        console.log(element?.innerText);
        
        

        dispatch({
          type: SelectActionKind.OPTION,
          payload: {
            value,
            label: element?.innerText ?? value,
          },
        });

        if (closeOnSelect) {
          onClose();
        }
      },
    };
  };

  const getMenuProps = (props?: GetSelectMenuOptions) => {
    if (props?.ref != null) {
      selectMenuRef = props.ref;
    }

    return {
      ref: selectMenuRef,
    };
  };

  const setStateValue = (value: string, element?: React.ReactElement) => {
    const label = element?.props.children ?? value;
    
    dispatch({
      type: SelectActionKind.OPTION,
      payload: {
        value,
        label
      }
    });
  }

  const addValueToForm = () => {
    return <input value={state.value} hidden={true}/>
  }


  return {
    state: {
      value: state.value,
      label: state.label,
      isOpen,
    },
    getButtonProps: {
      onClick: onToggle,
      id: buttonId,
    },
    getMenuProps,
    getOptionProps,
    setStateValue,
    addValueToForm
    // handleSearchText,
    // handleClickOutside,
    // getRenderedChildren,
  };
}

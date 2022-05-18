import { useIds } from "@chakra-ui/hooks";
import * as React from "react";
import { GetSelectMenuOptions, UseSelectReturn } from "../type";

const editDistance = require("edit-distance");
const remove = (_node: any) => 1;
const insert = remove;
const update = function (stringA: string, stringB: string) {
  return stringA !== stringB ? 1 : 0;
};

enum SelectActionKind {
  OPTION = "option",
  OPTION_TYPED = "option_type",
}

interface SelectAction {
  type: SelectActionKind;
  payload: {
    value: string;
    label: React.ReactNode;
  };
}

interface SelectState {
  label: React.ReactNode;
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
  placeholder?: React.ReactNode;
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
  const [searchText, setSearchText] = React.useState<string>("");

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

  function updateSearchText(key: string) {
    let newSearchText = searchText;
    if (key == "Backspace") {
      newSearchText = searchText.slice(0, -1);
    }

    if (key === "Esc" || key === "Escape") {
      newSearchText = "";
    }

    if (key.match(/^[a-zA-Z0-9\s+]$/)) {
      newSearchText = searchText.concat(key.toLowerCase());
    }

    setSearchText(newSearchText);
    return newSearchText;
  }

  const handleSearchText = React.useCallback(
    (event: KeyboardEvent) => {
      /**
       * Steps to handle the search text
       * 1. Figure out what the current search text is
       * 2. Find the list of ReactElements inside the selectMenuRef
       * 3. Sort the list of ReactElements given the search text,
       * 4. Render the list of select options
       *
       * When sorting, we should still maintain a copy of the original ReactElements & their order
       * We use this copy of original ReactElements whenever we want to handleSearchText
       */

      const node = selectMenuRef;

      console.log((selectMenuRef.current as any).childNodes);

      if (isOpen && node) {
        const newSearchText = updateSearchText(event.key);
        const children = node.current?.childNodes;

        if (children == null || children == undefined) {
          return;
        }

        let childrenAsArray = [];

        for (let i = 0; i < children!.length; i++) {
          childrenAsArray[i] = children.item(i);
        }
        console.log(childrenAsArray);

        if (childrenAsArray.length > 0) {
          let lowestDist: number = editDistance.levenshtein(
            newSearchText,
            childrenAsArray[0]!.childNodes,
            insert,
            remove,
            update
          ).distance;
          let lowIdx = 0;

          for (let i = 1; i < childrenAsArray.length; i++) {
            const currentDist: number = editDistance.levenshtein(
              newSearchText,
              childrenAsArray[i]!.childNodes,
              insert,
              remove,
              update
            ).distance;
            if (lowestDist > currentDist) {
              lowestDist = currentDist;
              lowIdx = i;
            }
          }

          dispatch({
            type: SelectActionKind.OPTION_TYPED,
            payload: {
              value: "hi", //childrenAsArray[lowIdx]?.value,
              label: lowIdx, //childrenAsArray[lowIdx]?.children,
            },
          });
        }
      }
    },
    [searchText]
  );

  const onClose = () => {
    setIsOpen(false);
  };
  const onToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchText("");
    }
  };

  /**
   * Generate unique ids for select's list and button
   */
  const [buttonId, selectListId] = useIds(`select-button`, `select-list`);
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
        setSearchText("");
      }
    },
    [selectMenuRef]
  );

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectMenuRef, isOpen, handleClickOutside]);

  React.useEffect(() => {
    document.addEventListener("keydown", handleSearchText);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleSearchText);
    };
  }, [isOpen, searchText, selectMenuRef]);

  const getOptionProps = ({ value }: { value: string }) => {
    return {
      id: selectListId,
      value,
      onClick: (_: React.MouseEvent) => {
        if (closeOnSelect) {
          onClose();
        }
        dispatch({
          type: SelectActionKind.OPTION,
          payload: {
            value,
            label: value, // TODO: fix removed label
          },
        });
      },
    };
  };

  const getMenuProps = (props?: GetSelectMenuOptions) => {
    if (props?.ref != null) {
      selectMenuRef = props.ref;
    }
    console.log(props);
    return {
      ref: selectMenuRef,
    };
  };

  return {
    state: {
      value: state.value,
      isOpen,
    },
    getButtonProps: {
      onClick: onToggle,
      id: buttonId,
    },
    getMenuProps,
    getOptionProps,
    // handleSearchText,
    // handleClickOutside,
    // getRenderedChildren,
  };
}

import {
  useIds,
} from "@chakra-ui/hooks"
import * as React from "react"
import { GetSelectMenuOptions, UseSelectReturn } from "../type";

const editDistance = require("edit-distance");
const remove = (_node: any) => 1;
const insert = remove;
const update = function (stringA: string, stringB: string) {
  return stringA !== stringB ? 1 : 0;
};

enum SelectActionKind {
  OPTION = "option",
  OPTION_TYPED = "option_type"
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

type SelectChildType =
  (string | number | React.ReactFragment | React.ReactElement<any, string | React.JSXElementConstructor<any>>);

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
  /**
   * placeholder to display when no value is selected
   */
  placeholder?: React.ReactNode
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
   * The value of the selected option item
   */
  const [value, setValue] = React.useState(null as string | null);

  /**
   * Typeahead: the current text being searched
   */
  const [searchText, setSearchText] = React.useState<string>("");

  function compareByLevenshteinDistance(a: SelectChildType, b: SelectChildType, baseString = searchText) {
    if (baseString === "") {
      return 0;
    }
  
    const aVal = (a as React.ReactElement).props.children.toLowerCase();
    const bVal = (b as React.ReactElement).props.children.toLowerCase();
  
    const levA = editDistance.levenshtein(
      baseString,
      aVal,
      insert,
      remove,
      update
    );
    const levB = editDistance.levenshtein(
      baseString,
      bVal,
      insert,
      remove,
      update
    );
    return levA.distance - levB.distance;
  }

  function reducer(state: SelectState, action: SelectAction) {
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

  const handleSearchText = React.useCallback((event: KeyboardEvent) => {
    const node = selectMenuRef.current;

    if (isOpen && node != undefined) {
      const newSearchText = updateSearchText(event.key);
      const children = node.children;
      
      // TODO: IM SORRY THIS IS SO SUS LMAO
      const childrenAsArray = children as unknown as React.ReactElement[];

      if (childrenAsArray.length > 0) {
        let lowestDist: number = editDistance.levenshtein(newSearchText,
          childrenAsArray[0].props.children, insert, remove, update).distance;
        let lowIdx = 0;

        for (let i = 1; i < childrenAsArray.length; i++) {
          const currentDist: number = editDistance.levenshtein(newSearchText,
            childrenAsArray[i].props.children, insert, remove, update).distance;
          if (lowestDist > currentDist) {
            lowestDist = currentDist;
            lowIdx = i;
          }
        }

        dispatch({
          type: SelectActionKind.OPTION_TYPED,
          payload: {
            value: childrenAsArray[lowIdx].props.value,
            label: childrenAsArray[lowIdx].props.children,
          }
        });
      }
    }
  }, [searchText]);  

  const onOpen = () => {
    setIsOpen(true);
  }
  const onClose = () => {
    setIsOpen(false);
  }
  const onToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchText("");
    }
  }


  /**
   * Generate unique ids for select's list and button
   */
  const [buttonId, selectListId] = useIds(`select-button`, `select-list`)
  // NOTE: mutability introduced here in order to reassign ref if a different ref was passed in
  let selectMenuRef = React.useRef<HTMLDivElement>(null)

  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    if (selectMenuRef.current && !selectMenuRef.current.contains(event.target as Node)) {
      onClose();
      setSearchText("");
    }
  }, [selectMenuRef]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectMenuRef, isOpen, handleClickOutside]);
  // this selectRef references the contaienr containing both the input & the list of options since we want to handle clicks that aren't clicking either

  React.useEffect(() => {
    document.addEventListener("keydown", handleSearchText);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleSearchText);
    };
  }, [isOpen, searchText]);

  const getOptionProps = ({ value }: { value: string }) => {
    return {
      id: selectListId,
      value,
      onClick: (e: React.MouseEvent) => {
        if (closeOnSelect) {
          onClose();
        }
        dispatch({
          type: SelectActionKind.OPTION,
          payload: {
            value,
            label: value, // TODO: fix removed label
          }
        });
      },
      // onClick: onClickOption,
    }
  }

  const getMenuProps = (props?: GetSelectMenuOptions) => { 
    if (props?.ref) {
      selectMenuRef = props.ref;
    }  
    return {
      ref: selectMenuRef,
    }
  }

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
  }
}
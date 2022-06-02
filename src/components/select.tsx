import {
  Box,
  chakra,
  Flex,
  HTMLChakraProps,
  BoxProps,
  InputProps,
  PropsOf,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  Variants,
} from "framer-motion";
import React, {ReactElement} from "react";
import {
  forwardRef,
  omitThemingProps,
} from "@chakra-ui/system";
import { useSelect } from "../hooks";
import {getIdxLowestLevenshteinDistance, SaitamaIcon, SelectVariant, sortByLevenshteinDistance, VARIANT_TO_SELECT_BUTTON_STYLE} from "../utils";

// https://reactjs.org/docs/composition-vs-inheritance.html
export interface SelectProps extends InputProps {
  rootProps?: RootProps;
  variant?: SelectVariant
}

interface RootProps extends Omit<HTMLChakraProps<"div">, "color"> {}

/**
 * React component used to select one item from a list of options.
 */
export const Select = forwardRef<SelectProps, "select">((props, _ref) => {
  const variant = props.variant ?? "outline";

  const {
    state,
    getButtonProps,
    getMenuProps,
    getOptionProps,
    setStateValue
  } = useSelect();

  const { rootProps, placeholder, ...rest } = omitThemingProps(props);

  const [searchText, setSearchText] = React.useState<string>("");

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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

    function handleSearchText(event: KeyboardEvent) {
      if (state.isOpen) {
        const newSearchText = updateSearchText(event.key);
        console.log(newSearchText);
        const childrenAsArray = props.children as ReactElement[];
        const lowestIdx = getIdxLowestLevenshteinDistance(childrenAsArray, newSearchText);
        const bestMatchProps = childrenAsArray[lowestIdx].props
        const bestMatch = childrenAsArray[lowestIdx];
        setStateValue(bestMatchProps.value, bestMatch);
      }
    }

    document.addEventListener("keydown", handleSearchText);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleSearchText);
    };
  }, [ref, state.isOpen, searchText]);

  /**
   * Alert if clicked on outside of element
   */

  let displayChildren = props.children;

  if (searchText !== "" && props.children) {
    displayChildren = sortByLevenshteinDistance(props.children as ReactElement[], searchText);
  }

  const renderedChildren = React.Children.map(displayChildren, (child) => {
    // Checking isValidElement is the safe way and avoids a typescript
    // error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...getOptionProps({ value: child.props.value }),
      });
    }
    return child;
  });

  return (
    <Box position="relative" {...rest}>
      <Flex
        w="full"
        h={10}
        borderRadius="md"
        align="center"
        justify="space-between"
        transitionDuration="normal"
        ref={ref}
        {...VARIANT_TO_SELECT_BUTTON_STYLE[variant]}
        {...getButtonProps}
      >
        {state.label ? <Text userSelect="none">{state.label}</Text> : <Text color={VARIANT_TO_SELECT_BUTTON_STYLE[variant].color ?? "gray.300"}>{placeholder}</Text>}
        { 
          variant === "saitama" ?
          <SaitamaIcon /> :
          <SelectIcon isOpen={state.isOpen} />
        } 
      </Flex>

      <AnimatePresence>
        {state.isOpen && (
          <Stack
            {...getMenuProps()}
            w="full"
            as={motion.div}
            position="absolute"
            zIndex={1}
            {...VARIANT_TO_SELECT_BUTTON_STYLE[variant]}
            py={2}
            borderRadius="md"
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 8,
            }}
            exit={{
              height: 0,
              opacity: 0,
              overflow: "hidden",
            }}
          >
            {renderedChildren} {/* <-- update this */}
          </Stack>
        )}
      </AnimatePresence>
      <input hidden value={state.value}></input>
    </Box>
  );
});

export const DefaultIcon: React.FC<PropsOf<"svg">> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </svg>
);

const IconWrapper = chakra(motion.div, {
  baseStyle: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    top: "50%",
    width: "1.5rem",
    height: "100%",
    color: "currentColor",
    fontSize: "1.25rem",
    _disabled: {
      opacity: 0.5,
    },
  },
});

interface SelectIconProps extends HTMLMotionProps<"div"> {
  isOpen: boolean;
}

const variants: Variants = {
  up: { rotate: 180 },
  down: { rotate: 0 },
};

const SelectIcon: React.FC<SelectIconProps> = (props) => {
  const { children = <DefaultIcon />, isOpen } = props;

  const clone = React.cloneElement(children as any, {
    role: "presentation",
    className: "chakra-select__icon",
    focusable: false,
    "aria-hidden": true,
    // force icon to adhere to `IconWrapper` styles
    style: {
      width: "1em",
      height: "1em",
      color: "currentColor",
    },
  });

  return (
    <IconWrapper
      animate={isOpen ? "up" : "down"}
      variants={variants}
      className="chakra-select__icon-wrapper"
    >
      {React.isValidElement(children) ? clone : null}
    </IconWrapper>
  );
};

interface SelectOptionProps extends BoxProps {
  value: string;
  setSelectedValue?: (value: string | null) => void | undefined;
  handleKeyPress?: (letter: number) => void;
  handleClick?: (value: string, label: React.ReactNode) => void;
  variant?: SelectVariant;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  children,
  value,
  handleClick = () => {},
  handleKeyPress = () => {},
  variant = "outline",
  ...props
}) => {
  
  return (
    <Box
      onClick={() => handleClick(value, children)}
      px={4}
      py={2}
      transitionDuration="normal"
      _hover={{
        bg: "gray.100",
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

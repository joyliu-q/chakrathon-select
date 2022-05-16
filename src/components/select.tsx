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
  useBoolean
} from "@chakra-ui/react";
import { AnimatePresence, HTMLMotionProps, motion, Variants } from "framer-motion";
import React, {ReactElement} from "react";
import {forwardRef, layoutPropNames, omitThemingProps} from "@chakra-ui/system";
import {split} from "@chakra-ui/utils";


const editDistance = require('edit-distance');
const remove = (node: any) => 1;
const insert = remove;
const update = function(stringA : string, stringB : string) { return stringA !== stringB ? 1 : 0; };

// https://reactjs.org/docs/composition-vs-inheritance.html
export interface SelectProps extends InputProps {
    rootProps?: RootProps;
}


interface RootProps extends Omit<HTMLChakraProps<"div">, "color"> {}


/**
 * React component used to select one item from a list of options.
 */
export const Select = forwardRef<SelectProps, "select">((props, _ref) => {

    const {size, children} = props;

    const {
        rootProps,
        placeholder,
        ...rest
    } = omitThemingProps(props);

    const [isOpen, setOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState("");
    const [layoutProps, _otherProps] = split(rest, layoutPropNames as any[]);

    function reducer(_state: any, action: any) {
        switch (action.type) {
            case 'option':
                return {value: action.payload};
            case 'reset':
                return {value: action.payload};
                return {value: action.payload};
            default:
                throw new Error();
        }
    }

    const [state, dispatch] = React.useReducer(reducer, {value: placeholder ?? "Select"});

    const ref = React.useRef<HTMLDivElement>(null);
    const selectRef = React.useRef<HTMLDivElement>(null);


    React.useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            if (!selectRef.current || selectRef.current.contains(event.target)) {
                setOpen(!isOpen);
                return;
            }

            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            } else if (ref.current !== null) {
                setOpen(!isOpen);
            }
        }

        function handleSearchText(event: any) {
            console.log(event);
            if (event.keyCode === 8) {
                setSearchText(searchText.slice(0, -1));
                console.log(searchText);
                return;
            }

            if (event.keyCode >= 48 && event.keyCode <= 90) {
                setSearchText(searchText + event.key);
            }
            console.log(searchText);
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleSearchText);

        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleSearchText);

        };
    }, [ref, selectRef, isOpen]);

    let childrenAsArray: ReactElement[] = [];
    if (children !== null) {
        childrenAsArray = children as ReactElement[];
    }

    if (searchText !== "") {
        childrenAsArray.sort(function (a: ReactElement, b: ReactElement) {
            const levA = editDistance.levenshtein(searchText, a.props.children, insert, remove, update);
            const levB = editDistance.levenshtein(searchText, b.props.children, insert, remove, update);
            return levA.distance - levB.distance;
        })
    }

    return (
        <Box position="relative">
            <Flex
                w="full"
                h={10}
                pl={4}
                pr={2}
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                align="center"
                justify="space-between"
                transitionDuration="normal"
                _hover={{
                    borderColor: "gray.300",
                }}
                ref={selectRef}
            >
                <Text userSelect="none">{state.value ?? placeholder}</Text>
                <SelectIcon isOpen={isOpen}/>
            </Flex>

            <AnimatePresence>
                {isOpen && (
                    <Stack
                        w="full"
                        as={motion.div}
                        position="absolute"
                        zIndex={1}
                        bg="white"
                        py={2}
                        border="1px solid"
                        borderColor="gray.200"
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
                        ref={ref}
                    >
                        {React.Children.map(props.children, child => {
                            // Checking isValidElement is the safe way and avoids a typescript
                            // error too.
                            if (React.isValidElement(child)) {
                                return React.cloneElement(child, {
                                    handleclick: (value: string) => dispatch({
                                        type: "option",
                                        payload: value
                                    })
                                });
                            }
                            return child;
                        })}
                    </Stack>
                )}
            </AnimatePresence>
        </Box>);
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
}

const SelectIcon: React.FC<SelectIconProps> = (props) => {
    const {children = <DefaultIcon/>, isOpen} = props;

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
        <IconWrapper animate={isOpen ? "up" : "down"} variants={variants} className="chakra-select__icon-wrapper">
            {React.isValidElement(children) ? clone : null}
        </IconWrapper>
    )
};


interface SelectOptionProps extends BoxProps {
  value?: string | null;
  setSelectedValue?: (value: string | null) => void | undefined;
  handleclick?: any;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  children,
    value = children,
  ...props
}) => {


      return (
          <Box
              onClick={() => {
                  if (props.handleclick && value) {props.handleclick(value)};
              }}
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


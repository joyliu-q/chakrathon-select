import { Flex, Text, Box } from "@chakra-ui/react";
import {
  forwardRef,
  layoutPropNames,
  omitThemingProps,
  HTMLChakraProps,
} from "@chakra-ui/system";
import { split } from "@chakra-ui/utils";
import * as React from "react";

type Omitted = "disabled" | "required" | "readOnly" | "size";

export interface SelectFieldProps
  extends Omit<HTMLChakraProps<"select">, Omitted> {
  isDisabled?: boolean;
}

interface RootProps extends Omit<HTMLChakraProps<"div">, "color"> {}

export interface SelectProps {
  rootProps?: RootProps;
}

/**
 * React component used to select one item from a list of options.
 */
export const Select = forwardRef<SelectProps, "select">((props, _ref) => {

  const {
    rootProps,
    placeholder,
    ...rest
  } = omitThemingProps(props);

  const [layoutProps, _otherProps] = split(rest, layoutPropNames as any[]);

  function reducer(_state: any, action: any) {
    switch (action.type) {
      case 'option':
        return {value: action.payload};
      case 'reset':
        return {value: action.payload} // TODO: pain
          //return init(action.payload);
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = React.useReducer(reducer, { value: placeholder ?? "Select" });
  const [isOpen, setIsOpen] = React.useState(false);
  
  /*
  1. Dropdown is open: clicking outside of the menu would close it
  2. Dropdown is closed: clicking the text would open it
  */
  return (
    <Flex
      {...layoutProps}
      {...rootProps}
      flexDir="column"
    >
      <>
        <Flex className="selectedItem" onClick={() => setIsOpen(!isOpen)}>
          <Text>{state.value ?? placeholder}</Text>
          {/* TODO chevron here*/}
        </Flex>
        {
          isOpen ? 
          <Box bgColor="grey" className="menu">
            {
              React.Children.map(props.children, child => {
                // Checking isValidElement is the safe way and avoids a typescript
                // error too.
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { handleClick: () => dispatch({type: "option", payload: child.props.value}) });
                }
                return child;
              })
            }
          </Box>
          : <></>
        }
        
      </>
    </Flex>
  );
});

interface SelectOptionProps extends HTMLChakraProps<"option"> {
  handleClick?: any;
}

export const SelectOption: React.FC<SelectOptionProps> = (props) => {
  const { children } = props;
  
  console.log(props);
  return (
    <Flex 
      onClick={() => { 
        if (props.handleClick && props.value) {props.handleClick(props.value)};
      }}
      p={4}
      m={1}
      border="2px black solid"
    >
      {children}
    </Flex>
  );
};

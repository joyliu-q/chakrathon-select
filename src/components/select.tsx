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
  useBoolean,
} from "@chakra-ui/react";
import { AnimatePresence, HTMLMotionProps, motion, Variants } from "framer-motion";
import React from "react";

// https://reactjs.org/docs/composition-vs-inheritance.html
interface SelectProps extends InputProps {}

const Select: React.FC<SelectProps> = ({ size, children }) => {
  const selectedValue = "Option 1";
  const [isOpen, setOpen] = useBoolean();

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
        onClick={setOpen.toggle}
      >
        <Text userSelect="none">{selectedValue}</Text>
        <SelectIcon isOpen={isOpen} />
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
          >
            {children}
          </Stack>
        )}
      </AnimatePresence>
    </Box>
  );
};

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
    <IconWrapper animate={isOpen ? "up" : "down"} variants={variants} className="chakra-select__icon-wrapper">
      {React.isValidElement(children) ? clone : null}
    </IconWrapper>
  );
};

interface SelectOptionProps extends BoxProps{}

const SelectOption: React.FC<SelectOptionProps> = ({
  children,
  ...props
}) => {
  return (
    <Box
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

export { Select, SelectOption };

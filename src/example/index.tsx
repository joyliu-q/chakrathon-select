import {
  Box,
  Button,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Select, SelectOption } from "../components/select";
import { Select as ChakraSelect } from "@chakra-ui/react";
import { useSelect } from "../hooks";
import React from "react";

function handleSubmit(e: any) {
  e.preventDefault();
  console.log(e.target[0].value);
}

function Form() {
  const {
    state, 
    getButtonProps,
    getOptionProps,
    getMenuProps,
    getContainerProps
  } = useSelect();

  return (
    <Stack spacing={4} p={16}>
      <Text>
        Custom Select (Component)
      </Text>
      <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      <Text>
        Custom useSelect (Hook)
      </Text>
      <Box {...getContainerProps()}>
        <Box {...getButtonProps()} bgColor="grey">{state.value == "" ? "Press to select!" : state.value}</Box>
        {state.isOpen ?
          <VStack align="start" py={2} {...getMenuProps()}>
            <Button {...getOptionProps({ value: "one" })}>Option 1</Button>
            <Button {...getOptionProps({ value: "two" })}>Option 2</Button>
            <Button {...getOptionProps({ value: "three" })}>Option 3</Button>
          </VStack>
          : null}
      </Box>
      <Text>
        Chakra's Select
      </Text>
      <ChakraSelect>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </ChakraSelect>
    </Stack>
  );
}

export default Form;

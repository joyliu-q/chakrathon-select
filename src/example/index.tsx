import {
  Box,
  Button,
  Stack,
  Text,
  VStack,
  FormControl,
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
    // openAndFocusFirstItem,
    // openAndFocusLastItem,
    // buttonId,
    // selectId,
    value,
    isOpen,
    onToggle,
    onOpen,
    onClickOption,
    selectRef,
    selectButtonRef,
    selectMenuRef,
  } = useSelect();

  React.useEffect((): void => {
    console.log(onOpen);
  }, [isOpen, onOpen]);

  return (
    <Stack spacing={4} p={16}>
      <Text>Custom Select (Component)</Text>
      <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      <Text>Custom useSelect (Hook)</Text>
      <Box ref={selectRef}>
        <Button ref={selectButtonRef} onClick={() => onToggle()}>
          {value ?? "Press to select!"}
        </Button>
        {isOpen ? (
          <VStack align="start" ref={selectMenuRef} py={2}>
            <Button value="lol" onClick={onClickOption}>
              Option 1
            </Button>
            <Button value="xd" onClick={onClickOption}>
              Option 2
            </Button>
            <Button value="lmao" onClick={onClickOption}>
              Option 3
            </Button>
          </VStack>
        ) : null}
      </Box>
      <Text>Chakra's Select</Text>
      <ChakraSelect>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </ChakraSelect>

      <form onSubmit={handleSubmit}>
        <FormControl>
          <Select>
            <SelectOption value="1">Option 1</SelectOption>
            <SelectOption value="2">Option 2</SelectOption>
            <SelectOption value="3">Option 3</SelectOption>
            <SelectOption value="4">Option 4</SelectOption>
          </Select>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Sign In
        </Button>
      </form>
    </Stack>
  );
}

export default Form;

// return (
//     <Center height='100vh' width='100vw'>
//         <Container height='80%' width='70%'>
//             <Box height="15%">
//                 <Heading as='h1' size='xl' fontSize='200%' fontWeight='medium'>
//                     Send a Hero Thank You Note
//                 </Heading>
//                 <Text>Which hero would you like to thank?</Text>
//             </Box>
//
//             <form>
//                 <Stack height="75%" spacing={6}>
//                     <FormControl maxW="300px" maxH="300px">
//                         <FormLabel htmlFor="heroes" fontWeight="600">S-Tier Heroes:</FormLabel>
//                         <Select name="heroes" placeholder="One">
//                             <SelectOption value="Select">Select</SelectOption>
//                             <SelectOption value="One">One</SelectOption>
//                             <SelectOption value="Two">Two</SelectOption>
//                         </Select>
//                     </FormControl>
//
//                     <FormControl>
//                         <FormLabel htmlFor="num_saved" fontWeight="600">How many people did this hero
//                             save?</FormLabel>
//                         <NumberInput name="num_saved" maxW="300px" maxH="300px">
//                             <NumberInputField/>
//                             <NumberInputStepper>
//                                 <NumberIncrementStepper/>
//                                 <NumberDecrementStepper/>
//                             </NumberInputStepper>
//                         </NumberInput>
//                     </FormControl>
//
//                     <FormControl>
//                         <FormLabel htmlFor="msg" fontWeight="600">Enter your thank you message</FormLabel>
//                         <Textarea placeholder='Type your heartfelt message here.'/>
//                     </FormControl>
//
//                     <Flex minWidth='max-content' alignItems='center' gap='2'>
//                         <Spacer/>
//                         <Button maxW="150px" colorScheme='teal' type='submit'>
//                             Submit
//                         </Button>
//                     </Flex>
//                 </Stack>
//             </form>
//         </Container>
//     </Center>

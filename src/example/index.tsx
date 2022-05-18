import {
  Box,
  Button,
  Stack,
  Text,
  // VStack,
  FormControl,
  FormLabel,
  NumberInput,
  Container,
  Heading,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  Center,
  Textarea,
  Spacer,
  Flex
} from "@chakra-ui/react";
import { Select, SelectOption } from "../components/select";
// import { Select as ChakraSelect } from "@chakra-ui/react";
// import { useSelect } from "../hooks";
import { useState } from "react";

function Form() {

  const [formSelection, setFormSelection] = useState();
  function handleSubmit(e: any) {
    e.preventDefault();
    setFormSelection(e.target[0].value);
  }


  // const {
  //   state,
  //   getButtonProps,
  //   getOptionProps,
  //   getMenuProps,
  //   addValueToForm
  // } = useSelect();

  //   return (
  //     <Stack spacing={4} p={16}>
  //       <Text fontWeight={500}>Custom Select (Outline)</Text>
  //       <Select variant="outline" placeholder="Select an option">
  //         <SelectOption value="1">Option 1</SelectOption>
  //         <SelectOption value="2">Option 2</SelectOption>
  //         <SelectOption value="3">Option 3</SelectOption>
  //         <SelectOption value="4">Option 4</SelectOption>
  //       </Select>
  //       <Text fontWeight={500}>Custom Select (Filled)</Text>
  //       <Select variant="filled" placeholder="Select an option">
  //         <SelectOption value="1">Option 1</SelectOption>
  //         <SelectOption value="2">Option 2</SelectOption>
  //         <SelectOption value="3">Option 3</SelectOption>
  //         <SelectOption value="4">Option 4</SelectOption>
  //       </Select>
  //       <Text fontWeight={500}>Custom Select (Unstyled)</Text>
  //       <Select variant="unstyled" placeholder="Select an option">
  //         <SelectOption value="1">Option 1</SelectOption>
  //         <SelectOption value="2">Option 2</SelectOption>
  //         <SelectOption value="3">Option 3</SelectOption>
  //         <SelectOption value="4">Option 4</SelectOption>
  //       </Select>
  //       <Text fontWeight={500}>Custom Select (Saitama)</Text>
  //       <Select variant="saitama" placeholder="Select an option">
  //         <SelectOption value="1">Option 1</SelectOption>
  //         <SelectOption value="2">Option 2</SelectOption>
  //         <SelectOption value="3">Option 3</SelectOption>
  //         <SelectOption value="4">Option 4</SelectOption>
  //       </Select>
  //       <Text>Custom useSelect (Hook)</Text>
  //       <Box>
  //         <Box {...getButtonProps} bgColor="gray.300" textColor="white" p={2}>{state.value === "" ? "Press to select!" : state.value}</Box>
  //         {state.isOpen ?
  //           <VStack align="start" py={2} {...getMenuProps()}>
  //             <Button {...getOptionProps({ value: "one" })}>Option 1</Button>
  //             <Button {...getOptionProps({ value: "two" })}>Option 2</Button>
  //             <Button {...getOptionProps({ value: "three" })}>Option 3</Button>
  //           </VStack>
  //         : null}
  //       </Box>
  //       {addValueToForm()}
  //       <Text>Chakra's Select</Text>
  //       <ChakraSelect>
  //         <option value="1">Option 1</option>
  //         <option value="2">Option 2</option>
  //         <option value="3">Option 3</option>
  //       </ChakraSelect>
  //       <form onSubmit={handleSubmit}>
  //         <FormControl>
  //           <Select>
  //             <SelectOption value="1">Option 1</SelectOption>
  //             <SelectOption value="2">Option 2</SelectOption>
  //             <SelectOption value="3">Option 3</SelectOption>
  //             <SelectOption value="4">Option 4</SelectOption>
  //           </Select>
  //         </FormControl>
  //         <Button width="full" mt={4} type="submit">
  //           Sign In
  //         </Button>
  //       </form>
  //     </Stack>
  //   );
  // }

  // export default Form;

  return (
    <Center height="100vh" width="100vw">
      <Container height="80%" width="70%">
        <Box height="15%">
          <Heading as="h1" size="xl" fontSize="200%" fontWeight="medium">
            Send a Hero Thank You Note
          </Heading>
          <Text>Which hero would you like to thank?</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack height="75%" spacing={6}>
            <FormControl maxW="300px" maxH="300px">
              <FormLabel htmlFor="heroes" fontWeight="600">
                S-Tier Heroes:
              </FormLabel>
              <Select name="heroes" placeholder="Select Hero">
                <SelectOption value="Select">Blast</SelectOption>
                <SelectOption value="One">Tornado of Terror</SelectOption>
                <SelectOption value="Two">Silver Fang</SelectOption>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="num_saved" fontWeight="600">
                How many people did this hero save?
              </FormLabel>
              <NumberInput name="num_saved" maxW="300px" maxH="300px">
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="msg" fontWeight="600">
                Enter your thank you message
              </FormLabel>
              <Textarea placeholder="Type your heartfelt message here." />
            </FormControl>

            <Flex minWidth="max-content" alignItems="center" gap="2">
              <Spacer />
              <Button maxW="150px" colorScheme="teal" type="submit">
                Submit
              </Button>
            </Flex>
            {formSelection ? <Text> You have chosen to send a message to {formSelection}</Text> : <></>}
          </Stack>
        </form>
      </Container>
    </Center>
  );
}

export default Form;

import {Box, Button, Stack, Text, VStack} from "@chakra-ui/react";
import {Select, SelectOption} from "../components/select";
import {Select as ChakraSelect} from "@chakra-ui/react";
import { useSelect } from "../hooks";
import React from "react";

function Form() {
    const [value, setValue] = React.useState(null as string | null);
    
    const {
      openAndFocusSelect,
      // openAndFocusFirstItem,
      // openAndFocusLastItem,
      descendants,
      // buttonId,
      // selectId,
      isOpen,
      // onToggle,
      onOpen,
      onClose,
      selectRef,
      buttonRef,
    } = useSelect();
    

    React.useEffect((): void => {
      console.log(descendants);
      console.log(onOpen);
    })

    return (
      <Stack spacing={4} p={16}>
        <Text>
          Custom Select (Component)
        </Text>
        <Select>
          <SelectOption value="1">Option 1</SelectOption>
          <SelectOption value="2">Option 2</SelectOption>
          <SelectOption value="3">Option 3</SelectOption>
          <SelectOption value="4">Option 4</SelectOption>
        </Select>
        <Text>
          Custom useSelect (Hook)
        </Text>
        <Box ref={selectRef}>
          <Button ref={buttonRef} onClick={() => openAndFocusSelect}>{value ?? "Press to select!"}</Button>
          {isOpen ? 
            <VStack>
              <Button value="lol" onClick={() => openAndFocusSelect}>Option 1</Button>
              <Button value="xd" onClick={() => openAndFocusSelect}>Option 2</Button>
              <Button value="lmao" onClick={() => openAndFocusSelect}>Option 3</Button>
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

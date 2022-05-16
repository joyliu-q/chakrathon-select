import { Box, Stack } from "@chakra-ui/react";
import { Select, SelectOption } from "../components/select";
import { Select as ChakraSelect } from "@chakra-ui/react";

function Form() {
  return (
      <Stack spacing={4}>

  <Select></Select>
  <ChakraSelect>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
  </ChakraSelect>

</Stack>
  )
}

export default Form;

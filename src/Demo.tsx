import { Box, Flex, Text } from "@chakra-ui/react";
import { Select, SelectOption } from "./components";

const Demo = () => {
  return (
    <Flex flexDir="column" align="center" justify="center" w="full" h="100vh">
      <Text>Select Component</Text>
      <Box>
        <Select>
          <SelectOption value="1">Option 1</SelectOption>
          <SelectOption value="1">Option 1</SelectOption>
          <SelectOption value="1">Option 1</SelectOption>
        </Select>
      </Box>
      <Text>useSelect Hook</Text>
      {/* TODO */}
    </Flex>
  );
};

export default Demo;

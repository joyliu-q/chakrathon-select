import { ChakraProvider, Box } from "@chakra-ui/react";

import { Select } from "./components";

function App() {
  return (
    <ChakraProvider>
      <Box m="auto" maxW="300px" maxH="300px">
        <Select>
          <option value="">Select</option>
          <option value="1">One</option>
        </Select>
      </Box>
    </ChakraProvider>
  );
}

export default App;

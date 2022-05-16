import { ChakraProvider } from "@chakra-ui/react";
import Form from "./example";

function App() {
  return (
    <ChakraProvider>
      <Form />
    </ChakraProvider>
  );
}

export default App;

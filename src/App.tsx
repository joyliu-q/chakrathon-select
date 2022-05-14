import Demo from "./example";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <Demo />
    </ChakraProvider>
  );
}

export default App;

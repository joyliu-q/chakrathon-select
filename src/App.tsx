import { ChakraProvider } from "@chakra-ui/react";
import Demo from "./Demo";

function App() {
  return (
    <ChakraProvider>
      <Demo />
    </ChakraProvider>
  );
}

export default App;

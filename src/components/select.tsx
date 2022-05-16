import { Box } from "@chakra-ui/react";


// https://reactjs.org/docs/composition-vs-inheritance.html
interface SelectProps {
  defaultValue?: string;
  placeholder?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  defaultValue,
  children
}) => {
  return <Box /*w="full"*/ h="10" border="1px solid">
    {defaultValue ?? "Select"}
    <Box>
      {children}
    </Box>
  </Box>;
};

interface SelectOptionProps extends Partial<HTMLOptionElement> {
  color?: string;
  value?: string; 
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({color, value, disabled}) => {
  return <Box w='100%' color={color}>WHEEEEEEE</Box>;
};

export { Select, SelectOption };

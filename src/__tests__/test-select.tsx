import { render, screen, fireEvent, within, waitForElementToBeRemoved } from '@testing-library/react';
import TestSelect from "./test-components/test-select-component";
import '@testing-library/jest-dom'
import { Select, SelectOption } from '../components/select';


const onClickId = 'select-test';
const options = ['1', '2', '3', '4'];

test('sanity check', () => {
  render(<TestSelect />);
  expect(screen.getByText('Custom Select (Component)')).toBeInTheDocument();

});

test('renders select', () => {

render(
  <div data-testid="select-test">
  <Select placeholder="Select an option">
        {/* <div data-testid="option-test"> */}
        <SelectOption value="1">Option 1</SelectOption>
        {/* </div> */}
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      </div>);
  const placeholder_text = 'Select an option';
  const linkElement = screen.getByText(placeholder_text);
  expect(linkElement).toBeInTheDocument();
});

test('select onClick', () =>  {
  
  render(
  <div data-testid="select-test">
  <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      </div>);
  fireEvent(
  screen.getByText("Select an option"),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));

  
  const OptionElement = within(screen.getByTestId(onClickId));
  expect(OptionElement.getByText('Option 1')).toBeInTheDocument();

});

test('select typeahead', () =>  {
    render(
  <div data-testid="select-test">
  <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      </div>);
  fireEvent(
  screen.getByText("Select an option"),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));


  fireEvent(
  screen.getByTestId(onClickId),
  new KeyboardEvent('1', {
    charCode: 49,
  }));
  const OptionElement = within(screen.getByTestId(onClickId));
  expect(OptionElement.getByText(options[0])).toBeInTheDocument();

})


test('select with click', () => {
  render(
  <div data-testid="select-test">
  <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      </div>);
  fireEvent(
  screen.getByText("Select an option"),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));



 const OptionElement = screen.getByText('Option 1');
 fireEvent(
  OptionElement,
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));

 
  const SelectElement = within(screen.getByTestId(onClickId));
  expect(SelectElement.getByText(options[0])).toBeInTheDocument();

});


test('click twice on dropdown', async () =>  {
  render(
  <div data-testid="select-test">
  <Select placeholder="Select an option">
        <SelectOption value="1">Option 1</SelectOption>
        <SelectOption value="2">Option 2</SelectOption>
        <SelectOption value="3">Option 3</SelectOption>
        <SelectOption value="4">Option 4</SelectOption>
      </Select>
      </div>);
  fireEvent(
  screen.getByText("Select an option"),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));
  
  fireEvent(
  screen.getByText("Select an option"),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }));
  const OptionElement = screen.queryByText('Option 1');
  await waitForElementToBeRemoved(OptionElement);
})
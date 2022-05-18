import React, {ReactElement} from "react";

export interface UseSelectReturn {
  state: SelectState;
  getButtonProps: GetSelectButtonProps;
  getMenuProps: (props?: GetSelectMenuOptions) => GetSelectMenuProps;
  getOptionProps: ({ value }: { value: string }) => GetSelectOptionProps;
  setStateValue: (value: string) => void;
  addValueToForm: () => ReactElement;
}

export type GetSelectMenuOptions = {
  ref?: React.RefObject<HTMLDivElement>;
};

export interface SelectState {
  value?: string;
  label?: string;
  isOpen: boolean;
  // TODO: add id
  //id: string;
}

//TODO: change later to support buttons
export interface GetSelectButtonProps {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  id: string;
}

export interface GetSelectMenuProps {
  ref: React.RefObject<HTMLDivElement>;
}

export interface GetSelectOptionProps {
  id: string;
  value: string;
  onClick: (event: React.MouseEvent) => void;
}

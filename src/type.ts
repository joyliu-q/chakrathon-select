import { BoxProps } from "@chakra-ui/react";
import React from "react";

export interface UseSelectReturn {
  state: SelectState;
  getButtonProps: () => GetSelectButtonProps;
  getMenuProps: (props?: GetSelectMenuOptions) => GetSelectMenuProps;
  getOptionProps: ({ value }: { value: string }) => GetSelectOptionProps;
  getContainerProps: () => GetSelectContainerProps;
}

export type GetSelectMenuOptions = {
  ref?: React.RefObject<HTMLDivElement>
}

export interface SelectState {
  value?: string;
  isOpen: boolean;
  // TODO: add id
  //id: string;
}

//TODO: change later to support buttons
export interface GetSelectButtonProps {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  id: string;
  tabIndex: number;
}

export interface GetSelectMenuProps {
  ref: React.RefObject<HTMLDivElement>;
}

export interface GetSelectOptionProps {
  id: string;
  value: string;
  onClick: (event: React.MouseEvent) => void;
}

export interface GetSelectContainerProps {
  ref: React.RefObject<HTMLDivElement>;
}

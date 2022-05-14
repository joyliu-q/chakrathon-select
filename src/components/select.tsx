import { useFormControl } from "@chakra-ui/form-control";
import {
  chakra,
  forwardRef,
  layoutPropNames,
  omitThemingProps,
  PropsOf,
  SystemStyleObject,
  useMultiStyleConfig,
  HTMLChakraProps,
} from "@chakra-ui/system";
import { cx, mergeWith, split } from "@chakra-ui/utils";
import * as React from "react";

type Omitted = "disabled" | "required" | "readOnly" | "size";

export interface SelectFieldProps
  extends Omit<HTMLChakraProps<"select">, Omitted> {
  isDisabled?: boolean;
}

export const SelectField = forwardRef<SelectFieldProps, "select">(
  (props, ref) => {
    const { children, placeholder, className, ...rest } = props;

    return (
      <chakra.select
        {...rest}
        ref={ref}
        className={cx("chakra-select", className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </chakra.select>
    );
  }
);

interface RootProps extends Omit<HTMLChakraProps<"div">, "color"> {}

export interface SelectProps {
  rootProps?: RootProps;
}

/**
 * React component used to select one item from a list of options.
 */
export const Select = forwardRef<SelectProps, "select">((props, ref) => {
  const styles = useMultiStyleConfig("Select", props);

  const {
    rootProps,
    placeholder,
    ...rest
  } = omitThemingProps(props);

  const [layoutProps, otherProps] = split(rest, layoutPropNames as any[]);

  const ownProps = useFormControl(otherProps);

  const rootStyles: SystemStyleObject = {
    width: "100%",
    height: "fit-content",
    position: "relative",
  };

  const fieldStyles: SystemStyleObject = mergeWith(
    { paddingEnd: "2rem" },
    styles.field,
    { _focus: { zIndex: "unset" } }
  );

  return (
    <chakra.div
      className="chakra-select__wrapper"
      __css={rootStyles}
      {...layoutProps}
      {...rootProps}
    >
      <SelectField
        ref={ref}
        height={"20px"}
        placeholder={placeholder}
        {...ownProps}
        __css={fieldStyles}
      >
        {props.children}
      </SelectField>
    </chakra.div>
  );
});

export const DefaultIcon: React.FC<PropsOf<"svg">> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </svg>
);

interface SelectOptionProps extends HTMLChakraProps<"option"> {}

export const SelectOption: React.FC<SelectOptionProps> = (props) => {
  const { children, ...rest } = props;

  return (
    <chakra.option {...rest} className="chakra-select__option">
      {children}
    </chakra.option>
  );
};

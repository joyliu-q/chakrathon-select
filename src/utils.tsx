import * as React from "react";
import { ReactElement } from "react";

const editDistance = require("edit-distance");
const remove = (_node: any) => 1;
const insert = remove;
const update = function (stringA: string, stringB: string) {
  return stringA !== stringB ? 1 : 0;
};

const elementToLevDistanceMap = new Map<string, number>();
const elementToStringMap = new Map<ReactElement, string>();

type SelectChildType =
  | string
  | number
  | React.ReactFragment
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>;

export const sortByLevenshteinDistance = (
  options: SelectChildType[],
  baseString: string
) => {
  if (options.length === 0) return options;

  let result;
  if (typeof options[0] === "string") {
    result = (options as string[])
      .slice()
      .sort((a, b) => compareByLevenshteinDistance(a, b, baseString));
  } else {
    result = (options as ReactElement[])
      .slice()
      .sort((a, b) =>
        compareByLevenshteinDistanceReactElement(a, b, baseString)
      );
  }
  elementToLevDistanceMap.clear();
  elementToStringMap.clear();
  return result;
};

export const getIdxLowestLevenshteinDistance = (
  options: SelectChildType[],
  baseString: string
) => {
  if (options.length === 0) return -1;

  if (typeof options[0] === "string") {
    return getLowestLevenshteinDistanceByString(
      options as string[],
      baseString
    );
  }

  const arr = (options as ReactElement[]).slice().map(extractStrFromElement);
  const result = getLowestLevenshteinDistanceByString(arr, baseString);
  elementToStringMap.clear();
  return result;
};

function getLowestLevenshteinDistanceByString(
  arr: string[],
  baseString: string
) {
  let lowestDist: number = editDistance.levenshtein(
    baseString,
    arr[0],
    insert,
    remove,
    update
  ).distance;
  let lowIdx = 0;

  for (let i = 1; i < arr.length; i++) {
    const currentDist: number = editDistance.levenshtein(
      baseString,
      arr[i],
      insert,
      remove,
      update
    ).distance;
    if (lowestDist > currentDist) {
      lowestDist = currentDist;
      lowIdx = i;
    }
  }

  return lowIdx;
}

function extractStrFromElement(element: ReactElement) {
  if (elementToStringMap.has(element)) {
    return elementToStringMap.get(element)!;
  }

  let value = element.props.children;

  while (typeof value !== "string") {
    value = (value as ReactElement).props.children;
  }

  return value;
}

function compareByLevenshteinDistanceReactElement(
  a: ReactElement,
  b: ReactElement,
  baseString: string
) {
  return compareByLevenshteinDistance(
    extractStrFromElement(a),
    extractStrFromElement(b),
    baseString
  );
}

function compareByLevenshteinDistance(
  a: string,
  b: string,
  baseString: string
) {
  if (baseString === "") {
    return 0;
  }

  let distanceA: number;
  if (elementToLevDistanceMap.has(a)) {
    distanceA = elementToLevDistanceMap.get(a)!;
  } else {
    distanceA = editDistance.levenshtein(
      baseString,
      a,
      insert,
      remove,
      update
    ).distance;
    elementToLevDistanceMap.set(a, distanceA);
  }

  let distanceB: number;
  if (elementToLevDistanceMap.has(b)) {
    distanceB = elementToLevDistanceMap.get(b)!;
  } else {
    distanceB = editDistance.levenshtein(
      baseString,
      b,
      insert,
      remove,
      update
    ).distance;
    elementToLevDistanceMap.set(b, distanceB);
  }

  return distanceA - distanceB;
}

const { web } = require("projen");
const project = new web.ReactTypeScriptProject({
  defaultReleaseBranch: "main",
  name: "chakrathon-select",

  deps: ["@chakra-ui/clickable",
    "@chakra-ui/descendant",
    "@chakra-ui/form-control",
    "@chakra-ui/popper",
    "@chakra-ui/react",
    "@chakra-ui/system",
    "@emotion/react",
    "@emotion/styled",
    "edit-distance",
    "framer-motion",
    "react",
    "react-dom",
    "react-scripts",
    "web-vitals"],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
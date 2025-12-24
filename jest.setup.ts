import React, { act } from "react";
import "@testing-library/jest-dom";

// Polyfill React.act for React 19 + Testing Library compatibility
// @ts-ignore
React.act = act;

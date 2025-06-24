import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Parser from "./parser.jsx";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Parser />} />
      </Routes>
    </>
  );
};
export default App;

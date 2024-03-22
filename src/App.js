import SearchSongs from "./api/search";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: rgba(128, 128, 128, 0.08);
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <SearchSongs />
    </>
  );
}

export default App;

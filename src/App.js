import './App.css';
import BandStructure from "./BandStructure";
import LatticeStructure from "./LatticeStructure";
//
// import data from "./data.txt";

function App() {
  // load the string from file
  return (
      <div>
      <BandStructure width={500} height={500} bandType={3} data={""}/>
      </div>

  );
}

export default App;

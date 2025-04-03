import { Link } from "react-router";
import reactLogo from "../assets/react.svg";

function SecondPage() {
  return (
    <div className="h-screen flex justify-center items-center flex-col space-x-4">
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} alt="React logo" className="w-36 h-36" />
        </a>
      </div>
      <h1>Infisical coding assignment page 2</h1>
      <div className="py-4">
        <Link to="/">Go to home page</Link>
      </div>
    </div>
  );
}

export default SecondPage;

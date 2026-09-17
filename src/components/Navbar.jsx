import { Link } from "react-router-dom";

function Navbar() {

  return (

    <nav className="navbar">

      <div className="logo">

        JC.

      </div>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/projects">Projects</Link>

        <Link to="/contact">Contact</Link>

      </div>

    </nav>

  );

}

export default Navbar;
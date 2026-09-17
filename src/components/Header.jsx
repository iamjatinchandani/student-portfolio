import { Link } from "react-router-dom";

function Header({ name }) {

    return (

        <header>

            <div className="avatar">
                👨‍💻
            </div>

            <h1>{name}</h1>

            <p>
                Computer Engineering Student
            </p>

            <p>
                Aspiring Full Stack Developer focused on building
                scalable web applications with modern technologies
                and solving real-world problems through software.
            </p>

            <div className="hero-buttons">

                <Link to="/projects">
                    <button>
                        View Projects
                    </button>
                </Link>

                <Link to="/contact">
                    <button>
                        Contact Me
                    </button>
                </Link>

            </div>

        </header>

    );

}

export default Header;
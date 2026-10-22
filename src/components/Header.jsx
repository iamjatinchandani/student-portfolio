function Header({ name = "Jatin Chandani" }) {
  const parts = name.trim().split(" ");
  const firstName = parts[0] || "Jatin";
  const lastName = parts.slice(1).join(" ") || "Chandani";

  return (
    <header className="hero-card">
      <h1 className="hero-name">
        <span className="name-line">{firstName}</span>
        <span className="name-line">{lastName}</span>
      </h1>
      <p className="hero-tagline">
        Full Stack Developer &amp; UI/UX Enthusiast
      </p>
    </header>
  );
}

export default Header;

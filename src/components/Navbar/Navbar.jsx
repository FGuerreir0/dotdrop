import './Navbar.css'
function Navbar () {

  return (
    <nav className="navbar">
      <img src="/icon.png" alt="Logo Icon" />
      <img src="/name.png" alt="Logo Name" />
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/canvas">Canvas</a></li>
      </ul>
    </nav>
  )
}

export default Navbar;
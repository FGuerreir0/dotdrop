import './Footer.css'

function Footer() {
  return (
      <footer className="app-footer">

 <section className="section-intro">
            <p>A collaborative pixel-art experience inspired by r/place.</p>
          </section>
        <p className="footer-text">FG © {new Date().getFullYear()}</p>
      </footer>
  )
}

export default Footer

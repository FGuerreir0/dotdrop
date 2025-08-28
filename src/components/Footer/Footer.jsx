import './Footer.css'

function Footer() {
  return (
      <footer className="app-footer">

 <section className="section-intro">
            <quote>A collaborative pixel-art experience inspired by r/place.</quote>
          </section>
        <p className="footer-text">FG © {new Date().getFullYear()}</p>
      </footer>
  )
}

export default Footer

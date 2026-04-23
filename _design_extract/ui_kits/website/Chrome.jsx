/* global React */
const { useState } = React;

// ===== TopNav =============================================================
function TopNav({ page, onNav }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'writing', label: 'Writing' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];
  return (
    <nav className="topnav">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNav('home'); }}>
        <span className="brand-word">Lime D<span className="brand-mark" aria-hidden="true"></span>ice</span>
      </a>
      <div className="topnav-links">
        {links.map((l) => (
          <a
            key={l.id}
            href="#"
            className={page === l.id ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNav(l.id); }}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="topnav-cta">
        <button className="btn btn-primary btn-sm" onClick={() => onNav('contact')}>
          Get in touch
        </button>
      </div>
    </nav>
  );
}

// ===== Footer =============================================================
function Footer({ onNav }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-dark">
            <span className="brand-word">Lime D<span className="brand-mark" aria-hidden="true"></span>ice</span>
          </div>
          <p className="footer-tag">Digital Health Specialists.</p>
        </div>
        <div>
          <h5>Site</h5>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNav('services'); }}>Services</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNav('writing'); }}>Writing</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNav('about'); }}>About</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNav('contact'); }}>Contact</a></li>
          </ul>
        </div>
        <div>
          <h5>Elsewhere</h5>
          <ul>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="mailto:hello@limedice.com">hello@limedice.com</a></li>
          </ul>
        </div>
        <div>
          <h5>Registered</h5>
          <p className="footer-meta">
            Lime Dice Ltd · Companies House <span className="mono">00000000</span><br/>
            Registered in England &amp; Wales.
          </p>
        </div>
      </div>
    </footer>
  );
}

window.TopNav = TopNav;
window.Footer = Footer;

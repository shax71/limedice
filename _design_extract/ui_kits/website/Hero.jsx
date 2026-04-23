/* global React */
const { useState: useStateH } = React;

function Hero({ treatment = 'bold', onNav }) {
  // bold = navy bg / white type / lime CTA
  // warm = mint bg  / navy type / lime CTA + terracotta accent
  const isBold = treatment === 'bold';
  return (
    <section className={`hero ${isBold ? 'hero-bold' : 'hero-warm'}`}>
      <div className="container hero-inner">
        <span className={`eyebrow ${isBold ? 'lime' : ''}`}>
          Digital Health Specialists
        </span>
        <h1 className="hero-title">
          Health systems,<br/>
          joined up properly.
        </h1>
        <p className="hero-lead">
          I work with NHS organisations and health tech suppliers to design
          architectures that share data safely and actually reach the patient.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => onNav('contact')}>
            Start a conversation
            <i data-lucide="arrow-right"></i>
          </button>
          <button
            className={isBold ? 'btn btn-ghost-dark' : 'btn btn-ghost'}
            onClick={() => onNav('services')}
          >
            How I work
          </button>
        </div>
        <div className="hero-proof">
          <span className="proof-label">Worked across</span>
          <span className="proof-item">NHS England</span>
          <span className="proof-sep">·</span>
          <span className="proof-item">Genomics Medicine Service</span>
          <span className="proof-sep">·</span>
          <span className="proof-item">Acute trusts</span>
          <span className="proof-sep">·</span>
          <span className="proof-item">ICBs</span>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;

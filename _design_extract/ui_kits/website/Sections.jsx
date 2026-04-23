/* global React */

// Three-pillar service section (used on Home)
function ServicePillars({ onNav }) {
  const pillars = [
    {
      icon: 'network',
      title: 'Architecture for NHS organisations',
      body: 'Design work for trusts, ICBs and national programmes. Pragmatic target architectures, integration patterns, and sequencing plans that survive contact with reality.',
    },
    {
      icon: 'compass',
      title: 'Advisory for health tech suppliers',
      body: 'Help for suppliers selling into the NHS: product-market fit, interoperability strategy, clinical safety and information governance positioning.',
    },
    {
      icon: 'git-branch',
      title: 'Specialist input on genomics & interoperability',
      body: 'Deep work on FHIR, SNOMED CT, consent, PDS, NRL, and the specific data-sharing problems that keep cropping up in genomics and shared care records.',
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How I work</span>
          <h2>Three pillars.</h2>
          <p className="lead">
            Most engagements fit one of these shapes. Sometimes all three.
          </p>
        </div>
        <div className="pillar-grid">
          {pillars.map((p) => (
            <article key={p.title} className="card pillar">
              <i data-lucide={p.icon} className="pillar-icon"></i>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <a
                href="#"
                className="pillar-link"
                onClick={(e) => { e.preventDefault(); onNav('services'); }}
              >
                Read more <i data-lucide="arrow-right"></i>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Editorial preview (Writing)
function EditorialCard({ eyebrow, title, dek, readTime }) {
  return (
    <article className="card editorial ed-card">
      <span className="eyebrow">{eyebrow} · {readTime} min</span>
      <h3>{title}</h3>
      <p>{dek}</p>
      <a href="#" className="ed-link">
        Read <i data-lucide="arrow-right"></i>
      </a>
    </article>
  );
}

function WritingTeaser({ onNav }) {
  const items = [
    {
      eyebrow: 'Writing',
      readTime: 6,
      title: 'Why most NHS data-sharing projects stall',
      dek: 'Three patterns that keep trusts stuck, and the cheapest way out of each.',
    },
    {
      eyebrow: 'Note',
      readTime: 4,
      title: 'FHIR is not a strategy',
      dek: 'A standard is not a plan. What a useful interoperability plan actually contains.',
    },
    {
      eyebrow: 'Case study',
      readTime: 8,
      title: 'Designing consent that people can actually read',
      dek: 'From a genomics shared-care-record programme. Still a work in progress.',
    },
  ];
  return (
    <section className="section mint">
      <div className="container">
        <div className="section-head split">
          <div>
            <span className="eyebrow">Writing</span>
            <h2>Recent thinking.</h2>
          </div>
          <button className="btn btn-link" onClick={() => onNav('writing')}>
            All writing <i data-lucide="arrow-right"></i>
          </button>
        </div>
        <div className="pillar-grid">
          {items.map((i) => <EditorialCard key={i.title} {...i} />)}
        </div>
      </div>
    </section>
  );
}

// Quote strip — featured card style
function QuoteStrip() {
  return (
    <section className="section tight">
      <div className="container">
        <article className="card featured pull-quote">
          <span className="eyebrow" style={{ color: '#74F443' }}>From a recent engagement</span>
          <p className="pull">
            "Most trusts have the data they need. What they don't have is a way
            to get it where it needs to go."
          </p>
        </article>
      </div>
    </section>
  );
}

window.ServicePillars = ServicePillars;
window.EditorialCard = EditorialCard;
window.WritingTeaser = WritingTeaser;
window.QuoteStrip = QuoteStrip;

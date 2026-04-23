/* global React */
const { useState: useStateP } = React;

// ---- About ---------------------------------------------------------------
function AboutPage({ onNav }) {
  return (
    <>
      <section className="section warm">
        <div className="container">
          <span className="eyebrow">About</span>
          <h1 className="about-title">Independent by design.</h1>
          <p className="lead about-lead">
            I'm Scott. I spent years inside NHS clinical systems and national
            programmes before starting Lime Dice. Independent because the best
            advice I can give usually isn't the advice a large consultancy is
            set up to sell.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container about-grid">
          <div>
            <h2>Background</h2>
            <p>
              Frontline clinical systems through to national programmes. I've
              sat on both sides of a supplier / NHS conversation, and I've
              shipped inside genomics, shared care records, and integration
              platforms that have to survive real clinical use.
            </p>
            <p>
              I'll name the standard (FHIR, SNOMED CT), the programme (GMS,
              GP Connect), and the trade-off. I won't promise frictionless
              transformation. Health data is hard.
            </p>
          </div>
          <aside className="card credibility">
            <h3>Where I've worked</h3>
            <ul className="cred-list">
              <li><i data-lucide="check"></i>NHS England — national programmes</li>
              <li><i data-lucide="check"></i>Genomics Medicine Service</li>
              <li><i data-lucide="check"></i>Acute trust integration teams</li>
              <li><i data-lucide="check"></i>ICB data strategy</li>
              <li><i data-lucide="check"></i>UK health-tech suppliers</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}

// ---- Services page -------------------------------------------------------
function ServicesPage({ onNav }) {
  const [open, setOpen] = useStateP(0);
  const rows = [
    {
      icon: 'network',
      title: 'Architecture for NHS organisations',
      body: 'Target architectures, integration patterns, and sequencing plans. Whether you\'re starting an interoperability programme or rescuing one, the job is the same: work out what you\'re building, in what order, and which choices are irreversible.',
      outputs: ['Target architecture document', 'Integration pattern library', 'Sequenced roadmap', 'Build-vs-buy analysis'],
    },
    {
      icon: 'compass',
      title: 'Advisory for health tech suppliers',
      body: 'If you\'re selling into the NHS, you need to speak its language — clinical safety, information governance, interoperability, procurement. I help suppliers position their product so trusts can actually buy it.',
      outputs: ['Interoperability strategy', 'DCB0129 / 0160 positioning', 'NHS-facing product narrative', 'Due-diligence prep'],
    },
    {
      icon: 'git-branch',
      title: 'Specialist input on genomics & data sharing',
      body: 'Deep engagements where clinical detail matters. FHIR Genomics, SNOMED CT, PDS, NRL, consent models. Work where getting the data model right is the whole job.',
      outputs: ['Data model design', 'Consent & audit patterns', 'Standards conformance review', 'Programme-level advice'],
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Services</span>
        <h1>How I work.</h1>
        <p className="lead">
          Three shapes of engagement. Click a row to see typical outputs.
        </p>
        <div className="service-rows">
          {rows.map((r, i) => {
            const isOpen = open === i;
            return (
              <div key={r.title} className={`service-row ${isOpen ? 'open' : ''}`}>
                <button className="service-head" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <i data-lucide={r.icon} className="service-icon"></i>
                  <h3>{r.title}</h3>
                  <i data-lucide={isOpen ? 'minus' : 'plus'} className="service-toggle"></i>
                </button>
                {isOpen && (
                  <div className="service-body">
                    <p>{r.body}</p>
                    <div className="service-outputs">
                      <span className="mono-label">Typical outputs</span>
                      <ul>
                        {r.outputs.map((o) => <li key={o}><i data-lucide="arrow-right"></i>{o}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="service-cta">
          <button className="btn btn-primary" onClick={() => onNav('contact')}>
            Start a conversation
            <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

// ---- Writing page --------------------------------------------------------
function WritingPage() {
  const items = [
    { eyebrow: 'Writing', readTime: 6, title: 'Why most NHS data-sharing projects stall', dek: 'Three patterns that keep trusts stuck, and the cheapest way out of each.' },
    { eyebrow: 'Note',    readTime: 4, title: 'FHIR is not a strategy', dek: 'A standard is not a plan. What a useful interoperability plan actually contains.' },
    { eyebrow: 'Case study', readTime: 8, title: 'Designing consent that people can actually read', dek: 'From a genomics shared-care-record programme. Still a work in progress.' },
    { eyebrow: 'Note',    readTime: 3, title: 'The Tuesday-morning test', dek: 'If it doesn\'t help the band 6 on a Tuesday morning, it\'s not done.' },
    { eyebrow: 'Writing', readTime: 5, title: 'What genomics taught me about integration', dek: 'High-volume, high-stakes, low-tolerance-for-mystery. A useful crucible.' },
    { eyebrow: 'Writing', readTime: 7, title: 'Rescuing a stalled interoperability programme', dek: 'A short, opinionated sequence of questions to ask on day one.' },
  ];
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Writing</span>
        <h1>Thinking out loud.</h1>
        <p className="lead">
          Short, specific notes on the problems I keep running into. No
          "thought leadership" pieces.
        </p>
        <div className="writing-grid">
          {items.map((i) => (
            <article key={i.title} className="card editorial ed-card">
              <span className="eyebrow">{i.eyebrow} · {i.readTime} min</span>
              <h3>{i.title}</h3>
              <p>{i.dek}</p>
              <a href="#" className="ed-link">Read <i data-lucide="arrow-right"></i></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Contact page --------------------------------------------------------
function ContactPage() {
  const [form, setForm] = useStateP({ name: '', org: '', email: '', brief: '' });
  const [sent, setSent] = useStateP(false);
  const [errors, setErrors] = useStateP({});

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Required.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = 'Enter a valid email address.';
    if (!form.brief.trim()) err.brief = 'A sentence is plenty.';
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <section className="section">
        <div className="container contact-done">
          <i data-lucide="check-circle-2" className="big-tick"></i>
          <h1>Message sent.</h1>
          <p className="lead">Thanks — I'll reply within a couple of working days.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container contact-grid">
        <div className="contact-copy">
          <span className="eyebrow">Contact</span>
          <h1>Start a conversation.</h1>
          <p className="lead">
            Tell me what you're trying to solve. If it fits, I'll suggest a
            shape of engagement and what it would cost. If it doesn't, I'll say
            so and try to point you somewhere useful.
          </p>
          <ul className="contact-meta">
            <li><i data-lucide="mail"></i><a href="mailto:hello@limedice.com">hello@limedice.com</a></li>
            <li><i data-lucide="linkedin"></i><a href="#">LinkedIn</a></li>
          </ul>
        </div>
        <form className="card contact-form" onSubmit={submit} noValidate>
          <div className="field">
            <label>Your name</label>
            <input value={form.name} onChange={update('name')} style={errors.name ? { borderColor: 'var(--color-error)' } : {}}/>
            {errors.name && <span className="err">{errors.name}</span>}
          </div>
          <div className="field">
            <label>Organisation</label>
            <input value={form.org} onChange={update('org')} placeholder="NHS trust, ICB or supplier" />
          </div>
          <div className="field">
            <label>Work email</label>
            <input value={form.email} onChange={update('email')} style={errors.email ? { borderColor: 'var(--color-error)' } : {}}/>
            {errors.email && <span className="err">{errors.email}</span>}
          </div>
          <div className="field">
            <label>What are you trying to solve?</label>
            <textarea value={form.brief} onChange={update('brief')} rows={4} placeholder="A sentence or two is plenty." style={errors.brief ? { borderColor: 'var(--color-error)' } : {}}/>
            {errors.brief && <span className="err">{errors.brief}</span>}
          </div>
          <button type="submit" className="btn btn-primary">
            Send message <i data-lucide="arrow-right"></i>
          </button>
        </form>
      </div>
    </section>
  );
}

window.AboutPage = AboutPage;
window.ServicesPage = ServicesPage;
window.WritingPage = WritingPage;
window.ContactPage = ContactPage;

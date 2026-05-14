import { HOME_FAQ_ITEMS, HOME_SEO_SECTIONS } from "../../lib/seo/content";
import { SITE_NAME } from "../../lib/site";

export default function HomeSeoSections() {
  return (
    <>
      <section className="seo-content" aria-labelledby="mini-desawar-hero-intro">
        <p id="mini-desawar-hero-intro" className="seo-lead">
          {SITE_NAME} result today, fast result updates, and Desawar result history are
          published on this server-rendered page for quick mobile and desktop access.
        </p>
      </section>

      {HOME_SEO_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="seo-content"
          aria-labelledby={section.id}
        >
          <h2 id={section.id}>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      <section className="seo-content faq-section" aria-labelledby="mini-desawar-faq">
        <h2 id="mini-desawar-faq">Mini Desawar Result FAQ</h2>
        <div className="faq-list">
          {HOME_FAQ_ITEMS.map((item) => (
            <article key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

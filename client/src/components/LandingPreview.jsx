import { Check, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import "./landing-preview.css";

export default function LandingPreview({ product, content, warnings, publication, publishMessage }) {
  const images = product.images || [];
  const initialImage = content.hero?.image || images[0];
  const [activeIndex, setActiveIndex] = useState(Math.max(0, images.indexOf(initialImage)));
  const preset = content.design?.preset || "spotlight";
  const slider = content.design?.slider || "rail";
  const image = images[activeIndex] || initialImage;

  useEffect(() => {
    setActiveIndex(Math.max(0, images.indexOf(initialImage)));
  }, [product.productId, initialImage]);

  function moveImage(direction) {
    if (!images.length) return;
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <article className={`landing-preview landing-slider-${slider}`} data-template-preset={preset}>
      <header className="landing-preview-header">
        <div>
          <p className="landing-preview-eyebrow"><Sparkles size={13} /> {preset} · {slider}</p>
          <h2 className="landing-preview-title">Предпросмотр готового лендинга</h2>
        </div>
        {publication?.url && (
          <a href={publication.url} target="_blank" rel="noreferrer" className="landing-preview-published">
            Открыть на uCoz <ExternalLink size={15} />
          </a>
        )}
      </header>

      <div className="landing-preview-grid">
        <section className="landing-preview-hero">
          <div className="landing-preview-image-wrap">
            {image && <img src={image} alt={product.title} />}
            {images.length > 1 && <>
              <button type="button" className="landing-image-control is-prev" onClick={() => moveImage(-1)} aria-label="Предыдущее фото"><ChevronLeft size={18} /></button>
              <button type="button" className="landing-image-control is-next" onClick={() => moveImage(1)} aria-label="Следующее фото"><ChevronRight size={18} /></button>
              <span className="landing-image-count">{activeIndex + 1} / {images.length}</span>
              <div className="landing-image-strip">
                {images.slice(0, 8).map((item, index) => <button type="button" key={item} className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Фото ${index + 1}`}><img src={item} alt="" /></button>)}
              </div>
            </>}
          </div>
          <div className="landing-preview-hero-copy">
            <div className="landing-preview-meta">
              <span>{product.platform}</span>
              <span>ID {product.productId}</span>
              <strong>{product.priceWithoutWallet || product.price || "Цена уточняется"}</strong>
            </div>
            <p className="landing-preview-label">Hero content</p>
            <h1>{content.hero?.headline}</h1>
            <p className="landing-preview-subheadline">{content.hero?.subheadline}</p>
            <a href={content.cta?.url || product.productUrl} target="_blank" rel="noreferrer" className="landing-preview-cta">
              {content.cta?.text || "Купить на WB"} <ExternalLink size={15} />
            </a>
          </div>
        </section>

        <div className="landing-preview-details">
          <section className="landing-preview-panel landing-preview-benefits">
            <h3>Преимущества</h3>
            <ul>
              {(content.benefits || []).map((item) => (
                <li key={item}>
                  <span><Check size={11} strokeWidth={3} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {content.specifications?.length > 0 && (
            <section className="landing-preview-panel landing-preview-specs">
              <h3>Характеристики</h3>
              <dl>
                {content.specifications.map(({ label, value }) => (
                  <div key={`${label}-${value}`}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {product.description && <section className="landing-preview-panel landing-preview-description"><h3>Описание</h3><p>{product.description}</p></section>}

          {content.faq?.length > 0 && (
            <section className="landing-preview-panel landing-preview-faq">
              <h3>FAQ</h3>
              <div>
                {content.faq.map(({ question, answer }) => (
                  <details key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {(warnings?.length > 0 || publishMessage) && (
        <footer className="landing-preview-footer">
          {publishMessage && <p className="landing-preview-message">{publishMessage}</p>}
          {warnings?.map((warning) => <p key={warning}>⚠ {warning}</p>)}
        </footer>
      )}
    </article>
  );
}

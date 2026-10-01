'use client';
import { Fragment, useEffect, useState } from 'react';
import { useSiteConfig } from './use-site-config';
import { normalizePhone } from './site-config';

const numberLabel = index => String(index + 1).padStart(2, '0');
function Arrow({ diagonal = true }) {
 return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M8 6h10v10' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Brand({ brand }) { return <a className="brand" href="#conteudo"><span className="brand-symbol">{brand.symbol}</span><span className="brand-name">{brand.name}<small>{brand.subtitle}</small></span></a>; }
// Headline words rise one after another; spaces stay real so the line can wrap anywhere.
function Words({ text, start = 0 }) {
 return text.split(' ').filter(Boolean).map((word, i) => <Fragment key={i}>{i > 0 && ' '}<span className="word"><span style={{ '--d': start + i }}>{word}</span></span></Fragment>);
}
// Labels that already end in an arrow lose it where the button draws its own.
const bare = label => label.replace(/\s*[↗↘↓↑→]\s*$/, '');

// Client part of the page: receives the published content from the server and handles every interaction.
export default function Site({ initialConfig }) {
 const config = useSiteConfig(initialConfig);
 const { brand, header, hero, ticker, solutions, about, process, faq, contact, footer, appearance, profile } = config;
 const [menu,setMenu] = useState(false), [scrolled,setScrolled] = useState(false), [activeService,setActiveService] = useState(0), [openFaq,setOpenFaq] = useState(0), [interest,setInterest] = useState(''), [message,setMessage] = useState(''), [copied,setCopied] = useState(false), [copyError,setCopyError] = useState(false);
 const serviceIndex = Math.min(activeService, Math.max(0,solutions.items.length-1));
 const currentService = solutions.items[serviceIndex];
 const selectedInterest = [...solutions.items.map(item=>item.title),contact.otherOption].includes(interest) ? interest : solutions.items[0]?.title || contact.otherOption;
 // The number set in the manager wins; the environment variable is only a fallback.
 const phone = normalizePhone(contact.whatsapp || processEnvNumber());
 const canWhatsApp = /^[0-9]{12,13}$/.test(phone) && phone !== '5500000000000';
 const whatsappUrl = text => 'https://wa.me/'+phone+'?text='+encodeURIComponent(text);
 const years = /^\d{4}$/.test(profile.startYear) ? new Date().getFullYear() - Number(profile.startYear) : 0;
 const facts = [[profile.experienceLabel,profile.startYear],[profile.companyLabel,profile.company],[profile.locationLabel,profile.location]].filter(([,value])=>value);

 useEffect(() => {
  const onScroll = () => setScrolled(scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  return () => removeEventListener('scroll', onScroll);
 }, []);
 useEffect(() => {
  if(!menu) return;
  const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
  const onKey = event => { if(event.key==='Escape') setMenu(false); };
  addEventListener('keydown', onKey);
  return () => { document.body.style.overflow = previous; removeEventListener('keydown', onKey); };
 }, [menu]);
 useEffect(() => {
  if(!appearance.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = document.querySelectorAll('.site-root [data-reveal]');
  const observer = new IntersectionObserver(entries => entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('shown');observer.unobserve(entry.target);}}),{threshold:.12});
  elements.forEach(element=>{element.classList.add('will-reveal');observer.observe(element);});
  return ()=>{observer.disconnect();elements.forEach(element=>element.classList.remove('will-reveal','shown'));};
 },[appearance.animations,hero.visible,solutions.visible,about.visible,process.visible,faq.visible,contact.visible]);

 function startConversation(item){setInterest(item?.title || contact.otherOption);}
 // With a number configured the message goes straight to WhatsApp; otherwise it is shown to be copied.
 function submit(event){
  event.preventDefault();
  const name=new FormData(event.currentTarget).get('name').trim();
  if(!name) return;
  const text=contact.messageTemplate.replaceAll('{nome}',name).replaceAll('{assunto}',selectedInterest);
  setMessage(text);setCopied(false);setCopyError(false);
  // window.open returns null with 'noopener', so the opener is cut by hand; a blocked pop-up falls back to this tab.
  if(canWhatsApp){const opened=window.open(whatsappUrl(text),'_blank');if(opened)opened.opener=null;else location.href=whatsappUrl(text);}
 }
 const photo = about.photo
  ? <img src={about.photo} alt={about.photoAlt} fetchPriority="high"/>
  : <div className="portrait-placeholder"><svg viewBox="0 0 200 230" aria-hidden="true"><circle cx="100" cy="72" r="38"/><path d="M24 224v-29c0-43 34-72 76-72s76 29 76 72v29"/></svg><span>{profile.photoPlaceholder}</span></div>;

 return <div className={'site-root '+(!appearance.animations?'motion-off':'')} style={{'--accent':appearance.orange,'--base':appearance.background,'--text':appearance.text}}>
 {profile.demo&&<div className="demo-content-notice" role="note">{profile.demoNotice}</div>}
 <a className="skip" href="#conteudo">{config.accessibility.skipLabel}</a>

 <header className={'site-header'+(scrolled?' is-scrolled':'')+(menu?' is-open':'')}>
  <div className="container header-inner">
   <Brand brand={brand}/>
   <nav id="site-navigation" aria-label="Principal">{header.navigation.map((link,i)=><a key={i} href={link.href} onClick={()=>setMenu(false)}><span>{link.label}</span></a>)}</nav>
   <a className="header-contact" href={header.contactHref} onClick={()=>setMenu(false)}>{header.contactLabel}</a>
   <button className="menu-button" type="button" aria-expanded={menu} aria-controls="mobile-menu" aria-label={header.menuLabel} onClick={()=>setMenu(!menu)}><i/><i/></button>
  </div>
 </header>
 <div id="mobile-menu" className={'mobile-menu'+(menu?' is-open':'')} inert={!menu} aria-hidden={!menu}>
  <nav aria-label="Menu">{[...header.navigation,{label:header.contactLabel,href:header.contactHref}].map((link,i)=><a key={i} href={link.href} onClick={()=>setMenu(false)} style={{'--i':i}}><small>{numberLabel(i)}</small>{link.label}</a>)}</nav>
  <p>{brand.subtitle}</p>
 </div>

 <main id="conteudo">
 {hero.visible&&<section className="opening">
  <div className="opening-glow" aria-hidden="true"/>
  <div className="container opening-grid">
   <div className="opening-copy">
    <p className="kicker"><span/>{hero.eyebrow}</p>
    <h1><Words text={hero.title}/><br/><Words text={hero.secondLine} start={hero.title.split(' ').length}/> <em><Words text={hero.highlight} start={hero.title.split(' ').length+hero.secondLine.split(' ').length}/></em></h1>
    <p className="opening-description multiline">{hero.description}</p>
    <div className="opening-actions"><a className="cta cta-accent" href={hero.primaryHref}>{bare(hero.primaryLabel)}<Arrow/></a><a className="quiet-link" href={hero.secondaryHref}>{hero.secondaryLabel}</a></div>
   </div>
   <aside className="opening-visual" aria-label={profile.fullName}>
    <div className="portrait-arch">{photo}</div>
    {profile.startYear&&<div className="float-card float-year"><strong>{years>0?`${years}+`:profile.startYear}</strong><span>{years>0?`anos · ${profile.experienceLabel.toLowerCase()} ${profile.startYear}`:profile.experienceLabel}</span></div>}
    <div className="float-card float-paper"><span className="paper-label"><i/>{hero.paperLabel}</span><p>{hero.paperTitle} <em>{hero.paperHighlight}</em></p><div className="paper-sign"><span>{brand.symbol}</span><div><strong>{profile.fullName}</strong><small>{hero.paperFooter}</small></div></div></div>
   </aside>
   <div className="opening-bottom"><span>{hero.footnote}</span><a href={hero.scrollHref}>{hero.scrollLabel}<Arrow diagonal={false}/></a></div>
  </div>
 </section>}

 {ticker.visible&&<div className="expertise-bar" aria-label={ticker.items.join(', ')}><div className="ticker-track" aria-hidden="true">{[0,1,2].map(copy=><div className="ticker-group" key={copy}>{ticker.items.map((item,i)=><span key={i}>{item}<b>{ticker.symbol}</b></span>)}</div>)}</div></div>}

 {facts.length>0&&<section className="professional-facts container" aria-label="Informações profissionais" data-reveal>{facts.map(([label,value],i)=><div key={label} style={{'--i':i}}><span>{label}</span><strong>{value}</strong></div>)}</section>}

 {solutions.visible&&<section id="solucoes" className="section container">
  <div className="section-intro" data-reveal><div><p className="kicker">{solutions.eyebrow}</p><h2 className="multiline">{solutions.title}</h2></div><p className="multiline">{solutions.description}</p></div>
  <div className="solution-explorer" data-reveal>
   <div className="solution-tabs" role="tablist" aria-orientation="vertical" aria-label={solutions.title.replaceAll('\n',' ')}>{solutions.items.map((item,i)=><button type="button" role="tab" tabIndex={serviceIndex===i?0:-1} aria-selected={serviceIndex===i} aria-controls="solution-panel" id={'solution-tab-'+i} key={i} onClick={()=>setActiveService(i)} onKeyDown={event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?solutions.items.length-1:(serviceIndex+(event.key==='ArrowDown'?1:-1)+solutions.items.length)%solutions.items.length;setActiveService(next);document.getElementById('solution-tab-'+next)?.focus();}}}><span>{numberLabel(i)}</span><strong>{item.title}</strong>{item.featured&&<em>Mais procurado</em>}<Arrow/></button>)}</div>
   {currentService&&<div id="solution-panel" role="tabpanel" aria-labelledby={'solution-tab-'+serviceIndex} className="solution-detail">
    <div className="solution-decoration" aria-hidden="true">{currentService.icon}</div>
    <div className="solution-content" key={serviceIndex}><span className="detail-number">{numberLabel(serviceIndex)} / {numberLabel(solutions.items.length-1)}</span><h3>{currentService.title}</h3><p className="multiline">{currentService.description}</p><a className="cta cta-accent" href={currentService.href} onClick={()=>startConversation(currentService)}>{bare(currentService.buttonLabel)}<Arrow/></a></div>
   </div>}
  </div>
  <p className="section-note">{solutions.footnote}</p>
 </section>}

 {about.visible&&<section id="sobre" className="about-section"><div className="container about-layout">
  <div className="about-visual" data-reveal>
   <div className="about-photo">{about.photo?<img src={about.photo} alt={about.photoAlt} loading="lazy"/>:<div className="portrait-placeholder"><span>{profile.photoPlaceholder}</span></div>}</div>
   <blockquote className="about-quote"><span className="quote-label">{about.portraitLabel}</span><p className="multiline">{about.portraitText}</p><footer><span>{brand.symbol}</span>{about.signature}</footer></blockquote>
  </div>
  <div className="about-intro" data-reveal>
   <p className="kicker">{about.eyebrow}</p><h2 className="multiline">{about.title}</h2>
   <div className="professional-name"><strong>{profile.fullName}</strong><span>{profile.role}</span></div>
   <div className="about-body">{about.paragraphs.map((paragraph,i)=><p className="multiline" key={i}>{paragraph}</p>)}</div>
   <ul className="personal-values">{about.values.map((value,i)=><li key={i}><span>{numberLabel(i)}</span><div><h3>{value.title}</h3><p>{value.description}</p></div></li>)}</ul>
   <a className="quiet-link" href={about.href}>{bare(about.buttonLabel)}<Arrow/></a>
  </div>
 </div></section>}

 {(profile.milestones.some(item=>item.title.trim())||profile.credentials.some(item=>item.title.trim()))&&<section id="trajetoria" className="career-section section container"><div className="career-columns">
  {profile.milestones.some(item=>item.title.trim())&&<div><p className="kicker">Trajetória</p><h2>{profile.trajectoryTitle}</h2><ol className="career-timeline">{profile.milestones.filter(item=>item.title.trim()).map((item,i)=><li key={i} data-reveal><span>{item.period}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol></div>}
  {profile.credentials.some(item=>item.title.trim())&&<div className="credentials"><p className="kicker">Credenciais</p><h2>{profile.credentialsTitle}</h2>{profile.credentials.filter(item=>item.title.trim()).map((item,i)=><a key={i} href={item.href} data-reveal><span aria-hidden="true"><Arrow/></span><div><h3>{item.title}</h3><p>{item.description}</p></div></a>)}</div>}
 </div></section>}

 {process.visible&&<section id="processo" className="process-section"><div className="container">
  <div className="section-intro" data-reveal><div><p className="kicker">{process.eyebrow}</p><h2 className="multiline">{process.title}</h2></div><p>{process.description}</p></div>
  <ol className="process-line" data-reveal>{process.items.map((item,i)=><li key={i} style={{'--i':i}}><span className="process-number">{numberLabel(i)}</span><h3>{item.title}</h3><p className="multiline">{item.description}</p></li>)}</ol>
 </div></section>}

 {faq.visible&&<section id="faq" className="questions-section"><div className="container questions-layout">
  <div className="questions-intro" data-reveal><p className="kicker">{faq.eyebrow}</p><h2 className="multiline">{faq.title}</h2><p>{faq.description}</p><a className="quiet-link" href={header.contactHref}>{header.contactLabel}</a></div>
  <div className="question-list" data-reveal>{faq.items.map((item,i)=><div className={'question '+(openFaq===i?'is-open':'')} key={i}><h3><button id={'faq-question-'+i} type="button" aria-expanded={openFaq===i} aria-controls={'faq-answer-'+i} onClick={()=>setOpenFaq(openFaq===i?null:i)}><span className="question-number">{numberLabel(i)}</span><span>{item.question}</span><span className="question-toggle" aria-hidden="true"/></button></h3><div id={'faq-answer-'+i} role="region" aria-labelledby={'faq-question-'+i} className="question-answer" inert={openFaq!==i}><div><p className="multiline">{item.answer}</p></div></div></div>)}</div>
 </div></section>}

 {contact.visible&&<section id="contato" className="contact-section"><div className="container contact-card">
  <div className="contact-copy" data-reveal>
   <p className="kicker">{contact.eyebrow}</p><h2 className="multiline">{contact.title}</h2><p className="contact-description multiline">{contact.description}</p>
   {(profile.company||profile.location)&&<div className="contact-professional"><strong>{profile.company}</strong><span>{profile.location}</span></div>}
   <div className="professional-socials">{profile.socialLinks.filter(item=>item.label.trim()).map((item,i)=><a href={item.href} key={i}>{bare(item.label)}<Arrow/></a>)}</div>
   <div className="contact-signature"><span>{brand.symbol}</span><strong>{contact.signature}</strong></div>
  </div>
  <form className="contact-form" onSubmit={submit} data-reveal>
   <label htmlFor="name">{contact.nameLabel}</label><input id="name" name="name" required maxLength={60} autoComplete="given-name" placeholder={contact.namePlaceholder}/>
   <fieldset className="interest-options"><legend>{contact.interestLabel}</legend>{[...solutions.items.map(item=>item.title),contact.otherOption].map(option=><label key={option}><input type="radio" name="interest" value={option} checked={selectedInterest===option} onChange={()=>setInterest(option)}/><span>{option}</span></label>)}</fieldset>
   <button className="cta cta-accent" type="submit">{canWhatsApp?bare(contact.buttonLabel):'Preparar minha mensagem'}<Arrow/></button>
   <p className="form-note">{contact.footnote}</p>
   {message&&<div className="message-result" aria-live="polite">
    <div className="chat-bubble"><p>{message}</p><small>{canWhatsApp?'Enviada para o WhatsApp':'Prévia da mensagem'}</small></div>
    {canWhatsApp?<a className="cta cta-accent" href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">{bare(contact.whatsappLabel)}<Arrow/></a>:<><button className="copy-button" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);setCopyError(false);}catch{setCopyError(true);}}}>{copied?contact.copiedLabel:contact.copyLabel}</button>{copyError&&<p>{contact.copyError}</p>}<p className="form-note">{contact.missingContact}</p></>}
   </div>}
  </form>
 </div></section>}
 </main>

 <footer className="site-footer" id="rodape"><div className="container">
  {/* A closing invitation instead of a decorative wordmark: the page ends on the next step. */}
  <div className="footer-cta">
   <p className="footer-cta-title">{hero.paperTitle} <em>{hero.paperHighlight}</em></p>
   <a className="cta cta-accent" href={header.contactHref}>{bare(header.contactLabel)}<Arrow/></a>
  </div>
  <div className="footer-grid">
   <div className="footer-about"><Brand brand={brand}/><p>{footer.description}</p>{(profile.company||profile.location)&&<p className="footer-meta">{[profile.company,profile.location].filter(Boolean).join(' · ')}</p>}</div>
   <nav aria-label="Rodapé"><h2>Navegação</h2>{header.navigation.map((link,i)=><a key={i} href={link.href}>{link.label}</a>)}<a href={header.contactHref}>{bare(header.contactLabel)}</a></nav>
   {(footer.links.length>0||profile.socialLinks.some(item=>item.label.trim()))&&<div><h2>Links</h2>{[...profile.socialLinks.filter(item=>item.label.trim()),...footer.links].map((link,i)=><a key={i} href={link.href}>{bare(link.label)}<Arrow/></a>)}</div>}
   <a className="footer-back" href="#conteudo" aria-label={bare(footer.backToTop)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
  </div>
  <div className="footer-bottom"><span>{footer.copyright}</span><p>{footer.legalText}</p></div>
 </div></footer>
 </div>;
}
function processEnvNumber(){return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';}

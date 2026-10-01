'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { defaults, groups, labels, normalizeConfig, migrateConfig, normalizePhone, STORAGE_KEY } from '../site-config';
import { getBrowserClient, supabaseConfigured, CONTENT_ID, IMAGE_BUCKET } from '../lib/supabase';
import { refreshPublishedSite } from './actions';
import './admin.css';

// Lets the photo field upload straight to Supabase Storage without threading props through every field.
const UploadContext = createContext(null);

const clone = value => JSON.parse(JSON.stringify(value));
const anchors = { hero: 'conteudo', ticker: 'conteudo', solutions: 'solucoes', about: 'sobre', profile: 'sobre', process: 'processo', faq: 'faq', contact: 'contato', footer: 'rodape' };
function replaceAt(config, path, value) {
  const next = clone(config); let target = next;
  path.slice(0,-1).forEach(key => { target = target[key]; });
  target[path.at(-1)] = value; return next;
}
function newItem(template) {
  if (typeof template === 'string') return '';
  return Object.fromEntries(Object.entries(template).map(([key,value]) => [key, typeof value === 'boolean' ? false : key === 'href' ? '#contato' : typeof value === 'string' ? '' : clone(value)]));
}
// Shows how the number will be used and lets the owner test it before saving.
function WhatsAppHint({ value }) {
  const phone = normalizePhone(value);
  if (!value.trim()) return <small>Sem número, o site só prepara a mensagem para copiar. Digite com DDD; o 55 do Brasil é incluído automaticamente.</small>;
  if (!/^\d{12,13}$/.test(phone)) return <small className="field-error">Número incompleto: use DDD + número, por exemplo (11) 91234-5678.</small>;
  return <small>Mensagens vão para +{phone}. <a href={'https://wa.me/'+phone+'?text='+encodeURIComponent('Teste do site')} target="_blank" rel="noopener noreferrer">Testar no WhatsApp ↗</a></small>;
}
function Field({ value, path, template, onChange }) {
  const upload = useContext(UploadContext);
  const key = path.at(-1), id = 'editor-'+path.join('-'), label = labels[key] || key;
  if (Array.isArray(value)) return <div className="editor-list"><div className="list-heading"><h3>{label}</h3><span>{value.length} itens</span></div>{value.map((item,index)=><div className="list-item" key={index}><div className="item-toolbar"><strong>{typeof item==='object' ? item.title || item.question || item.label || `Item ${index+1}` : `Item ${index+1}`}</strong><div><button type="button" aria-label={`Mover item ${index+1} para cima`} disabled={index===0} onClick={()=>{const items=[...value];[items[index-1],items[index]]=[items[index],items[index-1]];onChange(path,items);}}>↑</button><button type="button" aria-label={`Mover item ${index+1} para baixo`} disabled={index===value.length-1} onClick={()=>{const items=[...value];[items[index+1],items[index]]=[items[index],items[index+1]];onChange(path,items);}}>↓</button><button className="danger" type="button" onClick={()=>onChange(path,value.filter((_,i)=>i!==index))}>Remover</button></div></div><Field value={item} path={[...path,index]} template={template[0]??{label:'',href:'#'}} onChange={onChange}/></div>)}<button className="add-button" type="button" disabled={value.length>=30} onClick={()=>onChange(path,[...value,newItem(template[0]??{label:'',href:'#'})])}>+ Adicionar item</button></div>;
  if (value && typeof value==='object') return <div className="editor-fields">{Object.entries(value).map(([key,item])=><Field key={key} value={item} path={[...path,key]} template={template[key]} onChange={onChange}/>)}</div>;
  if (typeof value==='boolean') return <label className="toggle-field" htmlFor={id}><span>{label}</span><input id={id} type="checkbox" checked={value} onChange={event=>onChange(path,event.target.checked)}/></label>;
  const isColor=path[0]==='appearance';
  return <div className={'editor-field '+(isColor?'color-field':'')}><label htmlFor={id}>{typeof key==='number'?`Texto ${key+1}`:label}</label>{isColor?<div><input id={id} type="color" value={value} onChange={event=>onChange(path,event.target.value)}/><code>{value}</code></div>:<textarea id={id} rows={/description|paragraphs|answer|Template|legalText/i.test(path.join('.'))?3:2} value={key==='photo'&&value.startsWith('data:')?'':value} placeholder={key==='photo'&&value.startsWith('data:')?'Imagem enviada — use uma URL para substituir':undefined} onChange={event=>onChange(path,event.target.value)}/>}{key==='photo'&&<><label className="photo-upload">Enviar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>3145728){window.alert('Use uma imagem de até 3 MB.');return;}try{onChange(path,await upload(file));}catch(error){window.alert('Não foi possível enviar a foto: '+(error.message||error));}}}/></label>{value&&<div className="photo-thumb"><img src={value} alt="Prévia da foto"/><button type="button" onClick={()=>onChange(path,'')}>Remover foto</button></div>}</>}{key==='whatsapp'&&<WhatsAppHint value={value}/>}{key==='messageTemplate'&&<small>Use {'{nome}'} e {'{assunto}'} para personalizar a mensagem.</small>}{/href$/i.test(String(key))&&<small>Use #contato, #solucoes, #sobre, #processo, #faq ou uma URL completa.</small>}</div>;
}
function Login({ client }) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(event){
    event.preventDefault();setBusy(true);setError('');
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(error.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error.message);
    setBusy(false);
  }
  return <main className="admin-login"><form onSubmit={submit}><span className="admin-login-mark">f.</span><h1>Gerenciador do site</h1><p>Entre com o e-mail e a senha cadastrados no Supabase.</p><label htmlFor="login-email">E-mail</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)}/><label htmlFor="login-password">Senha</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/>{error&&<p className="admin-login-error" role="alert">{error}</p>}<button className="admin-save" disabled={busy}>{busy?'Entrando…':'Entrar'}</button><a href="/">← Voltar ao site</a></form></main>;
}

export default function Admin() {
  const client = getBrowserClient();
  const [session,setSession]=useState(undefined),[admin,setAdmin]=useState(null);
  useEffect(()=>{
    if(!client) return;
    client.auth.getSession().then(({data})=>setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event,next)=>setSession(next));
    return ()=>data.subscription.unsubscribe();
  },[client]);
  // Only e-mails listed in site_admins may publish; the table only shows a person their own row.
  useEffect(()=>{
    if(!session){setAdmin(null);return;}
    client.from('site_admins').select('email').maybeSingle().then(({data,error})=>setAdmin(!error&&Boolean(data)));
  },[client,session]);
  if(!supabaseConfigured) return <main className="admin-login"><div><h1>Supabase não configurado</h1><p>Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local ou na Vercel.</p></div></main>;
  if(session===undefined||(session&&admin===null)) return <main className="admin-login"><p>Carregando…</p></main>;
  if(!session) return <Login client={client}/>;
  if(!admin) return <main className="admin-login"><div><h1>Acesso não autorizado</h1><p>{session.user.email} entrou, mas não está na lista de administradores (tabela site_admins).</p><button className="admin-save" onClick={()=>client.auth.signOut()}>Sair</button></div></main>;
  return <Editor client={client} email={session.user.email}/>;
}

function Editor({ client, email }) {
  const [draft,setDraft]=useState(clone(defaults)),[saved,setSaved]=useState(clone(defaults)),[group,setGroup]=useState('hero'),[status,setStatus]=useState(''),[ready,setReady]=useState(false),[mobile,setMobile]=useState(false),[confirmReset,setConfirmReset]=useState(false),[previewReady,setPreviewReady]=useState(false),[publishedAt,setPublishedAt]=useState(null),[publishing,setPublishing]=useState(false),[legacy,setLegacy]=useState(null);
  const preview=useRef(null),importInput=useRef(null);
  const dirty=JSON.stringify(draft)!==JSON.stringify(saved);
  useEffect(()=>{
    (async()=>{
      const { data, error } = await client.from('site_content').select('content, updated_at').eq('id', CONTENT_ID).maybeSingle();
      if (error) setStatus('Não foi possível ler o conteúdo publicado: '+error.message);
      else if (data?.content) { const config=migrateConfig(data.content); setDraft(config); setSaved(clone(config)); setPublishedAt(data.updated_at); }
      // Content saved by the old browser-only manager can be brought into the database once.
      try { const stored=localStorage.getItem(STORAGE_KEY); if(stored) setLegacy(migrateConfig(JSON.parse(stored))); } catch {}
      setReady(true);
    })();
  },[client]);
  useEffect(()=>{function onPreviewReady(event){if(event.origin===location.origin&&event.source===preview.current?.contentWindow&&event.data?.type==='portfolio-preview-ready'){setPreviewReady(true);preview.current.contentWindow.postMessage({type:'portfolio-preview',config:draft},location.origin);}}window.addEventListener('message',onPreviewReady);return()=>window.removeEventListener('message',onPreviewReady);},[draft]);
  useEffect(()=>{if(!previewReady)return;preview.current?.contentWindow?.postMessage({type:'portfolio-preview',config:draft},location.origin);},[draft,previewReady]);
  useEffect(()=>{function beforeUnload(event){if(dirty){event.preventDefault();event.returnValue='';}}window.addEventListener('beforeunload',beforeUnload);return()=>window.removeEventListener('beforeunload',beforeUnload);},[dirty]);
  function update(path,value){setDraft(current=>replaceAt(current,path,value));setStatus('');}
  async function uploadImage(file){
    const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[file.type];
    if(!ext) throw new Error('use PNG, JPEG ou WebP.');
    const name='fotos/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
    const { error } = await client.storage.from(IMAGE_BUCKET).upload(name, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) throw error;
    setStatus('Foto enviada. Clique em Publicar para aplicar no site.');
    return client.storage.from(IMAGE_BUCKET).getPublicUrl(name).data.publicUrl;
  }
  async function publish(){
    setPublishing(true);
    try{
      const config=normalizeConfig(draft);
      const now=new Date().toISOString();
      const { error } = await client.from('site_content').upsert({ id: CONTENT_ID, content: config, updated_at: now, updated_by: email });
      if (error) throw error;
      setSaved(clone(config));setDraft(config);setPublishedAt(now);
      const refreshed = await refreshPublishedSite().catch(()=>({ok:false}));
      setStatus(refreshed.ok?'Publicado. O site já mostra as alterações.':'Publicado. O site atualiza em até 5 minutos.');
    }catch(error){setStatus('Não foi possível publicar: '+(error.message||error));}
    setPublishing(false);
  }
  function exportConfig(){try{const config=normalizeConfig(draft);const url=URL.createObjectURL(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='portfolio-config.json';link.click();URL.revokeObjectURL(url);setStatus('JSON exportado com as alterações da prévia.');}catch(error){setStatus(error.message);}}
  async function importConfig(event){const file=event.target.files?.[0];if(!file)return;try{if(file.size>2000000)throw new Error('O arquivo deve ter até 2 MB.');const config=normalizeConfig(JSON.parse(await file.text()));setDraft(config);setStatus('Configuração importada para a prévia. Clique em Publicar para aplicar.');}catch(error){setStatus('Importação recusada: '+error.message);}event.target.value='';}
  const when=publishedAt?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(publishedAt)):null;
  return <UploadContext.Provider value={uploadImage}><div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="/">f. <span>Estúdio de conteúdo</span></a><span className="demo-label">{when?'PUBLICADO EM '+when:'AINDA NÃO PUBLICADO'}</span><nav aria-label="Seções do gerenciador">{Object.entries(groups).map(([key,label])=><button key={key} className={group===key?'active':''} onClick={()=>setGroup(key)}>{label}<span>↗</span></button>)}</nav><a className="view-site" href="/" target="_blank" rel="noopener noreferrer">Abrir site ↗</a><div className="admin-user"><span>{email}</span><button onClick={()=>{if(!dirty||window.confirm('Há alterações não publicadas. Sair mesmo assim?'))client.auth.signOut();}}>Sair</button></div></aside><main className="admin-main"><header className="admin-toolbar"><div><p>GERENCIADOR DO PORTFÓLIO</p><h1>{groups[group]}</h1></div><div className="admin-actions"><span className={dirty?'unsaved':'saved'}>{dirty?'Alterações não publicadas':'Tudo publicado'}</span><button className="admin-save" disabled={!ready||!dirty||publishing} onClick={publish}>{publishing?'Publicando…':'Publicar'}</button></div></header>{legacy&&<div className="mock-notice legacy-notice"><span>Encontramos conteúdo salvo neste navegador pela versão antiga do gerenciador.</span><button onClick={()=>{setDraft(legacy);setLegacy(null);setStatus('Conteúdo do navegador carregado na prévia. Revise e clique em Publicar.');}}>Carregar na prévia</button><button onClick={()=>{try{localStorage.removeItem(STORAGE_KEY);}catch{}setLegacy(null);}}>Descartar</button></div>}<div className="admin-status" role="status">{status}</div><div className="admin-workspace"><section className="editor-panel" aria-label={'Editar '+groups[group]}><div className="editor-intro"><h2>{groups[group]}</h2><p>Edite os campos abaixo. Quebras de linha são preservadas no site. Nada muda para os visitantes até você publicar.</p></div>{group==='profile'&&<p className="mock-notice">Substitua os exemplos pelos dados reais e envie a foto em Sobre e foto. Desmarque "Exibir aviso de conteúdo demonstrativo" quando terminar.</p>}{ready&&<Field value={draft[group]} path={[group]} template={defaults[group]} onChange={update}/>}</section><section className="preview-panel" aria-label="Prévia do site"><div className="preview-toolbar"><strong>Prévia ao vivo</strong><div><button aria-pressed={!mobile} onClick={()=>setMobile(false)}>Desktop</button><button aria-pressed={mobile} onClick={()=>setMobile(true)}>Celular</button></div></div><div className={'preview-frame '+(mobile?'mobile':'')}><iframe ref={preview} title="Prévia do portfólio" src={"/?preview=1#"+(anchors[group]||"conteudo")} onLoad={()=>{setPreviewReady(true);preview.current?.contentWindow?.postMessage({type:"portfolio-preview",config:draft},location.origin);}}/></div></section></div><div className="admin-backup"><div><strong>Backup</strong><p>Exporte um JSON para guardar uma cópia do conteúdo.</p></div><div><button onClick={exportConfig}>Exportar JSON</button><button onClick={()=>importInput.current.click()}>Importar JSON</button><input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importConfig}/><button className="danger" onClick={()=>setConfirmReset(true)}>Restaurar conteúdo inicial</button></div></div>{confirmReset&&<div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Restaurar o conteúdo inicial?</h2><p>O rascunho será substituído. Exporte um backup se quiser guardar suas alterações. A restauração só vale para o site depois de publicar.</p><div><button autoFocus onClick={()=>setConfirmReset(false)}>Cancelar</button><button className="admin-save" onClick={()=>{setDraft(clone(defaults));setConfirmReset(false);setStatus('Conteúdo inicial restaurado na prévia. Publique para aplicar.');}}>Restaurar rascunho</button></div></div></div>}</main></div></UploadContext.Provider>;
}

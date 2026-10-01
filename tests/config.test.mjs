import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, normalizeConfig, migrateConfig, normalizePhone } from '../app/site-config.js';

test('configuration export round trips without losing content', () => {
  assert.deepEqual(normalizeConfig(JSON.parse(JSON.stringify(defaults))), defaults);
});
test('imports can add and remove services and footer links', () => {
  const config = structuredClone(defaults);
  config.solutions.items = [];
  config.footer.links = [{ label: 'Instagram', href: 'https://instagram.com/example' }];
  assert.deepEqual(normalizeConfig(config).footer.links, config.footer.links);
  assert.deepEqual(normalizeConfig(config).solutions.items, []);
});
test('unsafe links, invalid colors and malformed imports are rejected', () => {
  for (const [section, key, value] of [['hero','primaryHref','javascript:alert(1)'], ['appearance','orange','red'], ['about','photo','data:image/svg+xml;base64,PHN2Zz4='], ['contact','whatsapp','123']]) {
    const config = structuredClone(defaults); config[section][key] = value;
    assert.throws(() => normalizeConfig(config));
  }
  assert.throws(() => normalizeConfig(null));
  assert.throws(() => normalizeConfig({ ...defaults, faq: { ...defaults.faq, items: 'invalid' } }));
});
test('unknown properties are discarded and absent fields use defaults', () => {
  assert.deepEqual(normalizeConfig({ unknown: 'ignored' }), defaults);
});

test('redesign migrates old defaults and preserves personal edits', () => {
  const previous = structuredClone(defaults);
  previous.hero.title = 'Crédito.';
  previous.about.signature = 'Flaviano Silva';
  previous.contact.whatsapp = '5511999999999';
  previous.solutions.items[0].description = 'Descrição personalizada.';
  const result = migrateConfig(previous);
  assert.equal(result.hero.title, defaults.hero.title);
  assert.equal(result.about.signature, 'Flaviano Silva');
  assert.equal(result.contact.whatsapp, '5511999999999');
  assert.equal(result.solutions.items[0].description, 'Descrição personalizada.');
});

test('professional data survives import and old configurations receive empty factual fields', () => {
  const config = structuredClone(defaults);
  config.profile.startYear = '2018';
  config.profile.company = 'Empresa de teste';
  config.profile.milestones = [{period:'2018',title:'Início da atuação',description:'Conteúdo de teste'}];
  assert.deepEqual(normalizeConfig(config).profile, config.profile);
  assert.equal(normalizeConfig({}).profile.startYear, defaults.profile.startYear);
  config.profile.startYear = 'dez anos';
  assert.throws(() => normalizeConfig(config));
});

test('new palette replaces the previous default colors but keeps custom ones', () => {
  const previous = structuredClone(defaults);
  previous.appearance = { ...previous.appearance, orange: '#f47b42', background: '#ffffff', text: '#232423' };
  assert.deepEqual(migrateConfig(previous).appearance, defaults.appearance);
  previous.appearance.orange = '#123456';
  assert.equal(migrateConfig(previous).appearance.orange, '#123456');
});

test('WhatsApp numbers accept formatting and get the country code', () => {
  assert.equal(normalizePhone('(11) 91234-5678'), '5511912345678');
  assert.equal(normalizePhone('+55 11 91234-5678'), '5511912345678');
  const config = structuredClone(defaults);
  config.contact.whatsapp = '(11) 91234-5678';
  assert.equal(normalizeConfig(config).contact.whatsapp, '5511912345678');
  config.contact.whatsapp = '1234';
  assert.throws(() => normalizeConfig(config));
});

test('the old fictitious number and send button text are replaced', () => {
  const previous = structuredClone(defaults);
  previous.contact.whatsapp = '5500000000000';
  previous.contact.buttonLabel = 'Preparar minha mensagem ↗';
  const result = migrateConfig(previous);
  assert.equal(result.contact.whatsapp, '');
  assert.equal(result.contact.buttonLabel, defaults.contact.buttonLabel);
});

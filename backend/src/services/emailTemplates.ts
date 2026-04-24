import { t } from '../utils/i18n'

type EventData = Record<string, string | number>

const BASE_HTML = (content: string) => `
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#13132a;border:1px solid rgba(255,107,0,0.2);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid rgba(255,107,0,0.15);">
              <p style="margin:0;font-size:10px;letter-spacing:4px;color:#8888aa;text-transform:uppercase;">AMG ENGINYERIA DIGITAL</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#FF6B00;letter-spacing:2px;">AMG</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <div style="border-left:3px solid #FF6B00;padding-left:16px;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,107,0,0.15);">
              <p style="margin:0;font-size:11px;color:#8888aa;">
                AMG Enginyeria Digital &nbsp;|&nbsp;
                <a href="mailto:info@amgdigital.es" style="color:#FF6B00;text-decoration:none;">info@amgdigital.es</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

function button(url: string, label: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td style="background:#FF6B00;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);">
          <a href="${url}" style="display:block;padding:12px 28px;color:#0d0d1a;font-size:12px;font-weight:bold;letter-spacing:3px;text-decoration:none;text-transform:uppercase;">${label}</a>
        </td>
      </tr>
    </table>
  `
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#e0e0f0;line-height:1.6;">${text}</p>`
}

function heading(text: string) {
  return `<h2 style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#e0e0f0;letter-spacing:1px;">${text}</h2>`
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,107,0,0.08);">
        <span style="font-size:11px;letter-spacing:2px;color:#8888aa;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,107,0,0.08);text-align:right;">
        <span style="font-size:14px;color:#e0e0f0;font-weight:bold;">${value}</span>
      </td>
    </tr>
  `
}

const TEMPLATE_BUILDERS: Record<string, (lang: string, data: EventData) => string> = {

  WELCOME: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(t('email.welcome_body', lang, { plan: String(data.plan || '') }))}
    ${data.portalUrl ? button(String(data.portalUrl), 'ACCEDIR AL PORTAL') : ''}
  `),

  INVOICE_GENERATED: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(t('email.invoice_ready', lang, { month: String(data.month || '') }))}
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
      ${infoRow('Factura', String(data.invoiceNumber || ''))}
      ${infoRow('Import', `${data.amount}€`)}
      ${infoRow('Mes', String(data.month || ''))}
    </table>
    ${data.portalUrl ? button(String(data.portalUrl), 'VEURE FACTURA') : ''}
  `),

  PAYMENT_REMINDER_7: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(t('email.payment_reminder_body', lang, { number: String(data.invoiceNumber || ''), amount: String(data.amount || '') }))}
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
      ${infoRow('Factura', String(data.invoiceNumber || ''))}
      ${infoRow('Import pendent', `${data.amount}€`)}
    </table>
    ${data.portalUrl ? button(String(data.portalUrl), 'PAGAR ARA') : ''}
  `),

  PAYMENT_REMINDER_30: (lang, data) => TEMPLATE_BUILDERS.PAYMENT_REMINDER_7(lang, data),

  USAGE_WARNING_80: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(t('email.usage_80_body', lang))}
    ${data.portalUrl ? button(String(data.portalUrl), 'VEURE ÚS') : ''}
  `),

  USAGE_LIMIT_100: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph('Has superat el límit del teu pla. Si us plau, contacta amb nosaltres o actualitza el teu pla.')}
    ${data.portalUrl ? button(String(data.portalUrl), 'GESTIONAR PLA') : ''}
  `),

  MAGIC_LINK: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || 'usuari') }))}
    ${paragraph(t('email.magic_link_body', lang))}
    ${data.magicLinkUrl ? button(String(data.magicLinkUrl), t('email.magic_link_button', lang)) : ''}
  `),

  OAUTH_CONNECTED: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(`El servei <strong style="color:#FF6B00;">${data.provider || ''}</strong> s'ha connectat correctament al teu portal.`)}
    ${data.portalUrl ? button(String(data.portalUrl), 'VEURE CONNEXIONS') : ''}
  `),

  PLAN_CHANGED: (lang, data) => BASE_HTML(`
    ${heading(t('email.greeting', lang, { name: String(data.name || '') }))}
    ${paragraph(`El teu pla ha canviat a <strong style="color:#FF6B00;">${data.plan || ''}</strong>.`)}
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
      ${infoRow('Nou pla', String(data.plan || ''))}
      ${infoRow('Nova quota', `${data.amount}€/mes`)}
    </table>
    ${data.portalUrl ? button(String(data.portalUrl), 'VEURE PORTAL') : ''}
  `),

  ONBOARDING_DAY1: (_lang, data) => BASE_HTML(`
    ${heading(`Hola ${data.name || ''}, recordes que et vas apuntar ahir?`)}
    ${paragraph(`Fa 24 hores que et vas unir al pla <strong style="color:#FF6B00;">${data.plan || ''}</strong>.`)}
    ${paragraph('Accedeix al teu portal i descobreix tot el que pots automatitzar. El primer pas és connectar el teu compte de WhatsApp.')}
    ${data.portalUrl ? button(String(data.portalUrl), 'EXPLORAR EL PORTAL') : ''}
  `),

  ONBOARDING_DAY7_ACTIVE: (_lang, data) => BASE_HTML(`
    ${heading(`${data.name || ''}, porta 7 dies amb nosaltres!`)}
    ${paragraph(`Estàs traient profit del teu pla <strong style="color:#FF6B00;">${data.plan || ''}</strong>.`)}
    ${paragraph('Ara que ja has explorat el portal, et proposem el proper nivell: configura les automatitzacions per respondre clients mentre dorms.')}
    ${paragraph('<strong style="color:#FF6B00;">Consell pro:</strong> activa el recordatori de cita automàtic i redueix les no-assistències fins a un 40%.')}
    ${data.portalUrl ? button(String(data.portalUrl), 'ACTIVAR AUTOMATITZACIONS') : ''}
  `),

  ONBOARDING_DAY7_INACTIVE: (_lang, data) => BASE_HTML(`
    ${heading(`${data.name || ''}, t'estem esperant!`)}
    ${paragraph('Fa 7 dies que et vas unir, però encara no has entrat al portal.')}
    ${paragraph('Sabem que els primers passos poden semblar complexos. Per això hem preparat un tutorial guiat de 5 minuts que et porta de la mà fins a tenir el teu primer bot actiu.')}
    ${data.portalUrl ? button(String(data.portalUrl), 'INICIAR TUTORIAL') : ''}
  `),

  ONBOARDING_DAY15: (_lang, data) => BASE_HTML(`
    ${heading(`${data.name || ''}, com van els primers 15 dies?`)}
    ${paragraph(`Ja portes dues setmanes amb el pla <strong style="color:#FF6B00;">${data.plan || ''}</strong>.`)}
    ${paragraph('Hem vist clients com tu que en dues setmanes ja han automatitzat la recollida de ressenyes, la confirmació de cites i la resposta a preguntes freqüents.')}
    ${paragraph('Vols que t\'ajudem a treure el màxim rendiment? Escriu-nos i t\'assignarem un tècnic per una sessió de 30 min gratuïta.')}
    <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td style="padding-right:16px;">
          ${data.portalUrl ? button(String(data.portalUrl), 'VEURE EL PORTAL') : ''}
        </td>
      </tr>
    </table>
  `),

  ONBOARDING_DAY30: (_lang, data) => BASE_HTML(`
    ${heading(`${data.name || ''}, fa un mes que som equip!`)}
    ${paragraph(`Celebrem el primer mes junts amb el pla <strong style="color:#FF6B00;">${data.plan || ''}</strong>.`)}
    ${paragraph('En aquest mes has pogut comprovar com l\'automatització transforma la gestió del teu negoci. Ara és moment d\'anar un pas més lluny.')}
    ${paragraph('<strong style="color:#FF6B00;">Tens algun suggeriment per millorar el servei?</strong> La teva opinió és molt valuosa per a nosaltres.')}
    ${data.portalUrl ? button(String(data.portalUrl), 'DEIXAR VALORACIÓ') : ''}
  `),

  REPORT_ADMIN_WEEKLY: (_lang, data) => BASE_HTML(`
    ${heading(`Informe setmanal — ${data.weekLabel || ''}`)}
    ${paragraph('Resum d\'activitat de tots els clients de la plataforma.')}
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
      ${infoRow('Clients actius', String(data.activeClients || 0))}
      ${infoRow('Nous clients', String(data.newClients || 0))}
      ${infoRow('Automatitzacions executades', String(data.executions || 0))}
      ${infoRow('Facturació del mes', `${data.billingMonth || 0}€`)}
    </table>
    ${data.reportUrl ? button(String(data.reportUrl), 'DESCARREGAR PDF') : ''}
  `),

  REPORT_CLIENT_MONTHLY: (_lang, data) => BASE_HTML(`
    ${heading(`${data.name || ''}, el teu informe de ${data.month || ''}`)}
    ${paragraph('Aquí tens el resum de l\'activitat del teu portal durant el mes passat.')}
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
      ${infoRow('Converses gestionades', String(data.conversations || 0))}
      ${infoRow('Automatitzacions executades', String(data.executions || 0))}
      ${infoRow('Temps estalviat (estimat)', `${data.timeSaved || 0}h`)}
    </table>
    ${data.reportUrl ? button(String(data.reportUrl), 'DESCARREGAR INFORME') : ''}
    ${data.portalUrl ? button(String(data.portalUrl), 'VEURE PORTAL') : ''}
  `),
}

const SUBJECTS: Record<string, string> = {
  WELCOME:                  'email.welcome_subject',
  INVOICE_GENERATED:        'email.invoice_subject',
  PAYMENT_REMINDER_7:       'email.payment_reminder_subject',
  PAYMENT_REMINDER_30:      'email.payment_reminder_subject',
  USAGE_WARNING_80:         'email.usage_80_subject',
  USAGE_LIMIT_100:          'email.usage_100_subject',
  MAGIC_LINK:               'email.magic_link_subject',
  OAUTH_CONNECTED:          'email.welcome_subject',
  PLAN_CHANGED:             'email.plan_changed_subject',
  ONBOARDING_DAY1:          '🚀 El teu portal t\'espera',
  ONBOARDING_DAY7_ACTIVE:   '⚡ Porta 7 dies amb nosaltres!',
  ONBOARDING_DAY7_INACTIVE: '👋 T\'estem esperant',
  ONBOARDING_DAY15:         '📊 Balanç dels teus primers 15 dies',
  ONBOARDING_DAY30:         '🎉 Un mes junts!',
  REPORT_ADMIN_WEEKLY:      '📈 Informe setmanal AMG',
  REPORT_CLIENT_MONTHLY:    '📊 El teu informe mensual',
}

export function buildTemplate(
  event: string,
  lang: string,
  data: EventData
): { subject: string; html: string } {
  const subjectKey = SUBJECTS[event] ?? 'email.welcome_subject'
  const subject    = t(subjectKey, lang, data as Record<string, string>)
  const builder    = TEMPLATE_BUILDERS[event]
  const html       = builder ? builder(lang, data) : BASE_HTML(`<p style="color:#e0e0f0;">${event}</p>`)
  return { subject, html }
}

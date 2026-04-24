type Lang = 'ca' | 'es' | 'en'

const TRANSLATIONS: Record<Lang, Record<string, Record<string, string>>> = {
  ca: {
    email: {
      welcome_subject:        'Benvingut/da a AMG Enginyeria Digital',
      invoice_subject:        'La teva factura del mes de {{month}}',
      usage_80_subject:       'Has consumit el 80% del teu pla',
      usage_100_subject:      'Has superat el límit del teu pla',
      payment_reminder_subject: 'Recordatori de pagament — Factura {{number}}',
      magic_link_subject:     'El teu link d\'accés a AMG Portal',
      plan_changed_subject:   'El teu pla ha canviat',
      greeting:               'Hola, {{name}}!',
      invoice_ready:          'La teva factura del mes de {{month}} ja està disponible.',
      magic_link_body:        'Fes clic al botó per accedir al portal. El link caducarà en 24 hores.',
      magic_link_button:      'ACCEDIR AL PORTAL',
      welcome_body:           'El teu compte a AMG Enginyeria Digital està llest. Pla actiu: {{plan}}.',
      payment_reminder_body:  'La factura {{number}} de {{amount}}€ continua pendent. Pots regularitzar-la des del teu portal.',
      usage_80_body:          'Has consumit el 80% dels recursos del teu pla. Si superes el límit s\'aplicaran excedents.',
    },
    pdf: {
      invoice_title:  'FACTURA',
      client:         'CLIENT',
      concept:        'CONCEPTE',
      quantity:       'QUANTITAT',
      unit_price:     'PREU UNIT.',
      amount:         'IMPORT',
      subtotal:       'SUBTOTAL',
      discount:       'DESCOMPTE',
      tax:            'IVA ({{rate}}%)',
      total:          'TOTAL',
      vat_included:   'IVA inclòs',
      issue_date:     'Data d\'emissió',
      due_date:       'Data de venciment',
      invoice_number: 'Número de factura',
    },
  },
  es: {
    email: {
      welcome_subject:        'Bienvenido/a a AMG Enginyeria Digital',
      invoice_subject:        'Tu factura del mes de {{month}}',
      usage_80_subject:       'Has consumido el 80% de tu plan',
      usage_100_subject:      'Has superado el límite de tu plan',
      payment_reminder_subject: 'Recordatorio de pago — Factura {{number}}',
      magic_link_subject:     'Tu link de acceso a AMG Portal',
      plan_changed_subject:   'Tu plan ha cambiado',
      greeting:               '¡Hola, {{name}}!',
      invoice_ready:          'Tu factura del mes de {{month}} ya está disponible.',
      magic_link_body:        'Haz clic en el botón para acceder al portal. El link caduca en 24 horas.',
      magic_link_button:      'ACCEDER AL PORTAL',
      welcome_body:           'Tu cuenta en AMG Enginyeria Digital está lista. Plan activo: {{plan}}.',
      payment_reminder_body:  'La factura {{number}} de {{amount}}€ sigue pendiente. Puedes regularizarla desde tu portal.',
      usage_80_body:          'Has consumido el 80% de los recursos de tu plan. Si superas el límite se aplicarán excedentes.',
    },
    pdf: {
      invoice_title:  'FACTURA',
      client:         'CLIENTE',
      concept:        'CONCEPTO',
      quantity:       'CANTIDAD',
      unit_price:     'PRECIO UNIT.',
      amount:         'IMPORTE',
      subtotal:       'SUBTOTAL',
      discount:       'DESCUENTO',
      tax:            'IVA ({{rate}}%)',
      total:          'TOTAL',
      vat_included:   'IVA incluido',
      issue_date:     'Fecha de emisión',
      due_date:       'Fecha de vencimiento',
      invoice_number: 'Número de factura',
    },
  },
  en: {
    email: {
      welcome_subject:        'Welcome to AMG Enginyeria Digital',
      invoice_subject:        'Your invoice for {{month}}',
      usage_80_subject:       "You've used 80% of your plan",
      usage_100_subject:      "You've exceeded your plan limit",
      payment_reminder_subject: 'Payment reminder — Invoice {{number}}',
      magic_link_subject:     'Your AMG Portal access link',
      plan_changed_subject:   'Your plan has changed',
      greeting:               'Hello, {{name}}!',
      invoice_ready:          'Your invoice for {{month}} is now available.',
      magic_link_body:        'Click the button to access the portal. The link expires in 24 hours.',
      magic_link_button:      'ACCESS PORTAL',
      welcome_body:           'Your AMG Enginyeria Digital account is ready. Active plan: {{plan}}.',
      payment_reminder_body:  'Invoice {{number}} for {{amount}}€ is still pending. You can settle it from your portal.',
      usage_80_body:          "You've used 80% of your plan resources. Overage charges apply if you exceed the limit.",
    },
    pdf: {
      invoice_title:  'INVOICE',
      client:         'CLIENT',
      concept:        'CONCEPT',
      quantity:       'QUANTITY',
      unit_price:     'UNIT PRICE',
      amount:         'AMOUNT',
      subtotal:       'SUBTOTAL',
      discount:       'DISCOUNT',
      tax:            'VAT ({{rate}}%)',
      total:          'TOTAL',
      vat_included:   'VAT included',
      issue_date:     'Issue date',
      due_date:       'Due date',
      invoice_number: 'Invoice number',
    },
  },
}

const VALID_LANGS: Lang[] = ['ca', 'es', 'en']

export function t(
  key: string,
  lang: string = 'ca',
  vars: Record<string, string | number> = {}
): string {
  const l: Lang = VALID_LANGS.includes(lang as Lang) ? (lang as Lang) : 'ca'
  const [namespace, ...rest] = key.split('.')
  const keyName = rest.join('.')

  let text = TRANSLATIONS[l]?.[namespace]?.[keyName] ?? key

  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{{${k}}}`, String(v))
  }

  return text
}

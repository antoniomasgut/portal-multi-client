'use client'
import { useOnboardingList, useTriggerOnboarding, OnboardingProgress } from '../../../../hooks/useOnboarding'

function DayBadge({ sentAt, day }: { sentAt: string | null; day: string }) {
  if (sentAt) {
    return (
      <span className="inline-flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest">D{day}</span>
        <span className="w-3 h-3 rounded-full bg-orange-500 block" title={new Date(sentAt).toLocaleDateString()} />
      </span>
    )
  }
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">D{day}</span>
      <span className="w-3 h-3 rounded-full bg-gray-700 block" />
    </span>
  )
}

function OnboardingRow({ op }: { op: OnboardingProgress }) {
  const daysSince = Math.floor(
    (Date.now() - new Date(op.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <tr className="border-b border-orange-900/20 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-100">{op.client.companyName}</p>
        <p className="text-xs text-gray-500 font-mono">{op.client.contactEmail}</p>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${op.hasAccessed ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
          {op.hasAccessed ? 'SÍ' : 'NO'}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-sm text-gray-400 font-mono">{daysSince}d</td>
      <td className="px-4 py-3">
        <div className="flex gap-3 justify-center">
          <DayBadge sentAt={op.day0SentAt}  day="0"  />
          <DayBadge sentAt={op.day1SentAt}  day="1"  />
          <DayBadge sentAt={op.day7SentAt}  day="7"  />
          <DayBadge sentAt={op.day15SentAt} day="15" />
          <DayBadge sentAt={op.day30SentAt} day="30" />
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {op.completedAt ? (
          <span className="text-xs text-green-400 font-mono">COMPLET</span>
        ) : (
          <span className="text-xs text-gray-500 font-mono">EN CURS</span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-xs text-gray-500 font-mono uppercase tracking-widest">
        {op.client.language}
      </td>
    </tr>
  )
}

export default function OnboardingPage() {
  const { data: list, isLoading } = useOnboardingList()
  const trigger = useTriggerOnboarding()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
            Onboarding
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Seqüència d'emails dia 0 / 1 / 7 / 15 / 30
          </p>
        </div>
        <button
          onClick={() => trigger.mutate()}
          disabled={trigger.isPending}
          className="btn-primary text-sm"
        >
          {trigger.isPending ? 'Processant...' : '▶ PROCESSAR PENDENTS'}
        </button>
      </div>

      {trigger.data && (
        <div className="alert-success text-sm">
          {(trigger.data as any).processed} email(s) enviats
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">Carregant...</div>
        ) : !list?.length ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">
            Cap client amb onboarding actiu
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Client</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Accedit</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Dies</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Emails enviats</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Estat</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Idioma</th>
              </tr>
            </thead>
            <tbody>
              {list.map(op => <OnboardingRow key={op.clientId} op={op} />)}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-gray-600 font-mono space-y-1">
        <p>● Punts taronges = email enviat · Punts grisos = pendent</p>
        <p>● "Accedit" = el client ha entrat al portal (condiciona el email dia 7)</p>
        <p>● El cron crida <code className="text-orange-400">GET /api/onboarding/process</code> cada dia a les 8:00</p>
      </div>
    </div>
  )
}

'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export interface AutomationTemplate {
  id:          string
  name:        string
  slug:        string
  description: string | null
  category:    string
  isActive:    boolean
}

export interface AutomationExecution {
  id:          string
  status:      'RUNNING' | 'SUCCESS' | 'FAILED'
  startedAt:   string
  finishedAt:  string | null
  durationMs:  number | null
  error:       string | null
}

export interface ClientAutomation {
  id:            string
  clientId:      string
  templateId:    string
  name:          string
  n8nWorkflowId: string | null
  status:        'INACTIVE' | 'ACTIVE' | 'PAUSED' | 'ERROR'
  errorCount:    number
  lastRunAt:     string | null
  lastError:     string | null
  createdAt:     string
  template:      AutomationTemplate
  executions:    AutomationExecution[]
}

export interface AutomationTemplateWithUsage extends AutomationTemplate {
  clientCount:  number
  workflowJson: Record<string, unknown>
}

// ── Templates ─────────────────────────────────────────────────────────

export function useAutomationTemplates() {
  return useQuery<AutomationTemplate[]>({
    queryKey: ['automation-templates'],
    queryFn:  async () => {
      const res = await api.get('/api/automations/templates')
      return res.data.data
    },
  })
}

export function useAutomationTemplatesWithUsage() {
  return useQuery<AutomationTemplateWithUsage[]>({
    queryKey: ['automation-templates-usage'],
    queryFn:  async () => {
      const res = await api.get('/api/automations/templates/usage')
      return res.data.data
    },
  })
}

export function useToggleTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/api/automations/templates/${id}/active`, { isActive }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-templates-usage'] })
      qc.invalidateQueries({ queryKey: ['automation-templates'] })
    },
  })
}

export function useTestTemplate() {
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/automations/templates/${id}/test`).then(r => r.data),
  })
}

// ── Automatitzacions d'un client ───────────────────────────────────────

export function useClientAutomations(clientId: string) {
  return useQuery<ClientAutomation[]>({
    queryKey: ['client-automations', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/automations`)
      return res.data.data
    },
    enabled: Boolean(clientId),
  })
}

// ── Crear automatització ───────────────────────────────────────────────

export function useCreateAutomation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) =>
      api.post(`/api/clients/${clientId}/automations`, { templateId }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-automations', clientId] })
    },
  })
}

// ── Toggle pause/resume ────────────────────────────────────────────────

export function useToggleAutomation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ autoId, active }: { autoId: string; active: boolean }) =>
      api.patch(`/api/clients/${clientId}/automations/${autoId}/toggle`, { active }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-automations', clientId] })
    },
  })
}

// ── Eliminar automatització ────────────────────────────────────────────

export function useDeleteAutomation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (autoId: string) =>
      api.delete(`/api/clients/${clientId}/automations/${autoId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-automations', clientId] })
    },
  })
}

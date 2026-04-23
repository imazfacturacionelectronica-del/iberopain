// supabase/functions/protocol-update-job/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
const PUBMED_API_KEY = Deno.env.get('PUBMED_API_KEY')!

async function searchPubMed(query: string, maxResults = 20): Promise<string> {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&api_key=${PUBMED_API_KEY}&datetype=pdat&reldate=183`
  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()
  const ids: string[] = searchData.esearchresult?.idlist ?? []

  if (ids.length === 0) return 'No se encontraron artículos nuevos en PubMed.'

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&rettype=abstract&retmode=text&api_key=${PUBMED_API_KEY}`
  const fetchRes = await fetch(fetchUrl)
  return await fetchRes.text()
}

async function updateProtocol(
  protocolId: string,
  protocolSlug: string,
  protocolTitle: string,
  currentContent: unknown,
  currentBibliography: unknown[]
) {
  const jobId = crypto.randomUUID()

  await supabase.from('protocol_update_jobs').insert({
    id: jobId,
    protocol_id: protocolId,
    status: 'running',
  })

  try {
    const pubmedQuery = `${protocolTitle} pain management treatment guidelines 2024 2025`
    const pubmedResults = await searchPubMed(pubmedQuery)

    const { data: versionsData } = await supabase
      .from('protocol_versions')
      .select('version_number')
      .eq('protocol_id', protocolId)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersionNumber = (versionsData?.[0]?.version_number ?? 0) + 1

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Eres un médico especialista en medicina del dolor. Revisa el siguiente protocolo clínico y actualízalo incorporando la nueva evidencia de los artículos de PubMed.

PROTOCOLO ACTUAL:
${JSON.stringify(currentContent, null, 2)}

NUEVA LITERATURA DE PUBMED (últimos 6 meses):
${pubmedResults}

INSTRUCCIONES:
1. Analiza si la nueva literatura cambia alguna recomendación del protocolo
2. Si hay cambios clínicamente relevantes, incorporarlos al protocolo
3. Si no hay cambios significativos, mantén el protocolo y explica por qué
4. Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "content": { ...protocolo actualizado con la misma estructura del actual... },
  "bibliography": [ ...referencias actualizadas incluyendo las nuevas... ],
  "search_summary": "Resumen en español de qué evidencia nueva se encontró y qué cambios se realizaron"
}`,
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude no retornó JSON válido')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.content || !Array.isArray(parsed.bibliography) || typeof parsed.search_summary !== 'string') {
      throw new Error(`Respuesta de Claude con estructura inválida: ${JSON.stringify(Object.keys(parsed))}`)
    }

    const { data: versionData } = await supabase
      .from('protocol_versions')
      .insert({
        protocol_id: protocolId,
        version_number: nextVersionNumber,
        content: parsed.content,
        bibliography: parsed.bibliography,
        generated_by: 'claude-api',
        search_summary: parsed.search_summary,
      })
      .select()
      .single()

    await supabase
      .from('protocols')
      .update({ status: 'review_pending' })
      .eq('id', protocolId)

    await supabase
      .from('protocol_update_jobs')
      .update({
        status: 'draft_ready',
        draft_version_id: versionData!.id,
        sources_searched: { pubmed: pubmedResults.length > 0 },
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID_ADMIN')
    if (telegramToken && telegramChatId) {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `🔔 <b>Protocolo listo para revisión</b>\n\n<b>${protocolTitle}</b> ha sido actualizado con nueva evidencia.\n\nRevisa y aprueba el borrador en la app CIDAL.`,
          parse_mode: 'HTML',
        }),
      })
    }

  } catch (error) {
    await supabase
      .from('protocol_update_jobs')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    throw error
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  const expectedToken = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  if (authHeader !== `Bearer ${expectedToken}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: protocols, error } = await supabase
    .from('protocols')
    .select('id, slug, title, current_version_id')
    .eq('status', 'published')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = []

  for (const protocol of protocols ?? []) {
    const { data: currentVersion } = await supabase
      .from('protocol_versions')
      .select('content, bibliography')
      .eq('id', protocol.current_version_id!)
      .single()

    if (!currentVersion) continue

    try {
      await updateProtocol(
        protocol.id,
        protocol.slug,
        protocol.title,
        currentVersion.content,
        currentVersion.bibliography as unknown[],
      )
      results.push({ protocol: protocol.slug, status: 'draft_ready' })
    } catch (e) {
      results.push({ protocol: protocol.slug, status: 'error', error: String(e) })
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title } = await req.json()
    const apiKey = Deno.env.get('GROQ_API_KEY')

    if (!apiKey) throw new Error('GROQ_API_KEY is not set')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Write a short professional task description in 2-3 sentences for a task titled: "${title}". Be concise and actionable. Only return the description, nothing else.`
        }],
        max_tokens: 150,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (data.error) throw new Error(data.error.message)

    const text = data.choices[0].message.content.trim()

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
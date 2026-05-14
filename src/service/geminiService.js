export const generateDescription = async (title) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  console.log('API Key loaded:', apiKey ? 'YES (' + apiKey.substring(0, 8) + '...)' : 'NO - undefined!')

  if (!apiKey) {
    throw new Error('API key is missing! Check Vercel environment variables.')
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a short professional task description in 2-3 sentences for: "${title}". Be concise and actionable.`
            }]
          }]
        })
      }
    )

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data))

    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text

  } catch (err) {
    console.error('Gemini error:', err.message)
    throw err
  }
}
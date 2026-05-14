export const generateDescription = async (title) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('API key missing')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
  if (data.error) throw new Error(data.error.message)
  return data.candidates[0].content.parts[0].text
}
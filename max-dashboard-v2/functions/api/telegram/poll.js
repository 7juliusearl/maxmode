export async function onRequestGet(context) {
  const { request } = context
  const url = new URL(request.url)
  const chatId = url.searchParams.get('chatId')
  
  if (chatId) {
    // Return stored actions for this chat
    return new Response(JSON.stringify({
      success: true,
      actions: [] // Would return from KV in production
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Poll endpoint ready',
    setup: 'Set TELEGRAM_BOT_TOKEN in wrangler.toml and configure webhook'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Action recorded'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

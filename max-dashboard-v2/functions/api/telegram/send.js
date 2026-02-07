export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Telegram sync ready',
    instructions: 'Set TELEGRAM_BOT_TOKEN in wrangler.toml'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const body = await request.json()
    const { chatId, text, tasks, parseMode = 'HTML' } = body
    
    if (!chatId || !text) {
      return new Response(JSON.stringify({ error: 'Missing chatId or text' }), { status: 400 })
    }
    
    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), { status: 500 })
    }
    
    // Build inline keyboard with task buttons
    let inlineKeyboard = []
    
    if (tasks && tasks.length > 0) {
      // Group tasks in rows of 2
      for (let i = 0; i < tasks.length; i += 2) {
        const row = []
        const task1 = tasks[i]
        row.push({
          text: `▶️ ${task1.text.substring(0, 20)}${task1.text.length > 20 ? '...' : ''}`,
          callback_data: `start_${task1.id}`
        })
        
        if (tasks[i + 1]) {
          const task2 = tasks[i + 1]
          row.push({
            text: `▶️ ${task2.text.substring(0, 20)}${task2.text.length > 20 ? '...' : ''}`,
            callback_data: `start_${task2.id}`
          })
        }
        
        inlineKeyboard.push(row)
      }
      
      // Add Done button row
      inlineKeyboard.push([{
        text: '✅ Mark All Done',
        callback_data: 'done_all'
      }])
    }
    
    const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      })
    })
    
    const result = await response.json()
    
    if (!result.ok) {
      console.error('Telegram API error:', result)
      return new Response(JSON.stringify({ error: result.description }), { status: 500 })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.result.message_id 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Telegram send error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

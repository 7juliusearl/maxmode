export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const body = await request.json()
    
    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), { status: 500 })
    }
    
    // Handle callback_query (button clicks)
    if (body.callback_query) {
      const { data, message, from } = body.callback_query
      const chatId = message.chat.id
      const messageId = message.message_id
      
      // Respond immediately to acknowledge
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: body.callback_query.id
        })
      })
      
      const [action, taskId] = data.split('_')
      
      if (action === 'start') {
        // Update message to show "Started"
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: `🔄 *Task Started*\n\n✅ Click "Done" when finished!`,
            parse_mode: 'Markdown'
          })
        })
        
        // Store in localStorage key for dashboard polling
        const key = `telegram_actions_${chatId}`
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        existing.push({ action: 'start', taskId, timestamp: Date.now() })
        // Keep last 10
        localStorage.setItem(key, JSON.stringify(existing.slice(-10)))
        
        return new Response(JSON.stringify({ 
          success: true, 
          action: 'start',
          taskId: taskId 
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        
      } else if (action === 'done') {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: `✅ *Task Completed*`,
            parse_mode: 'Markdown'
          })
        })
        
        return new Response(JSON.stringify({ 
          success: true, 
          action: 'done',
          taskId: taskId 
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        
      } else if (action === 'done_all') {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: `✅ *All Tasks Completed!*`,
            parse_mode: 'Markdown'
          })
        })
        
        return new Response(JSON.stringify({ 
          success: true, 
          action: 'done_all'
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    return new Response(JSON.stringify({ success: true }))
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

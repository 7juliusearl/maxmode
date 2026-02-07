export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    if (!env.TASKS) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'KV not configured' 
      }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    }
    
    const body = await request.json()
    const { tasks } = body
    
    await env.TASKS.put('all_tasks', JSON.stringify(tasks))
    
    // Also broadcast to connected clients via Durable Object or just return success
    
    return new Response(JSON.stringify({ 
      success: true, 
      saved: tasks.length 
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    })
  }
}

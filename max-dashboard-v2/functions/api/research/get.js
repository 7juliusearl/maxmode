export async function onRequestGet(context) {
  const { env } = context
  
  try {
    if (!env.TASKS) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'KV not configured' 
      }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    }
    
    const tasksJson = await env.TASKS.get('research_items')
    
    if (!tasksJson) {
      return new Response(JSON.stringify({ 
        success: true, 
        items: [] 
      }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      items: JSON.parse(tasksJson) 
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

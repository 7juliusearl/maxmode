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
    const { items } = body
    
    await env.TASKS.put('research_items', JSON.stringify(items))
    
    return new Response(JSON.stringify({ 
      success: true, 
      saved: items.length 
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

export async function onRequestGet({ env }) {
  // Hardcoded GHL credentials
  const GHL_API_KEY = 'pit-dc7352b9-49d1-4077-a500-a1d61bcdadef'
  const GHL_LOCATION_ID = 'n5WdzNvEsQ5VrNYaRPii'
  const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

  try {
    const url = `${GHL_BASE_URL}/contacts?locationId=${GHL_LOCATION_ID}&limit=10`
    
    const contactsResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
    })

    if (!contactsResponse.ok) {
      return new Response(JSON.stringify({ error: `API error: ${contactsResponse.status}` }), {
        status: contactsResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const contactsData = await contactsResponse.json()
    const totalContacts = contactsData.meta?.total || 0
    const contacts = (contactsData.contacts || []).map((contact) => ({
      id: contact.id,
      contactName: contact.contactName || contact.firstName || 'Unknown',
      lastMessage: `Source: ${contact.source || 'Unknown'}`,
      type: 'contact',
      timestamp: contact.dateAdded,
      unread: false,
    }))

    return new Response(JSON.stringify({
      unreadCount: Math.min(totalContacts, 99),
      conversations: contacts,
      contacts: totalContacts,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('GHL API Error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function onRequestGet({ env }) {
  // Gmail API via Google Apps Script or direct API
  // For now, return mock data until we set up OAuth
  
  const mockEmails = [
    {
      id: '1',
      from: 'WeddingWire',
      subject: 'New inquiry from your listing',
      snippet: 'Someone viewed your profile and sent an inquiry...',
      date: new Date().toISOString(),
      unread: true,
    },
    {
      id: '2',
      from: 'The Knot',
      subject: 'Review request reminder',
      snippet: 'You have pending reviews to respond to...',
      date: new Date(Date.now() - 3600000).toISOString(),
      unread: true,
    },
    {
      id: '3',
      from: 'Google Ads',
      subject: 'Your campaign performance report',
      snippet: 'Your ads received 1,234 impressions this week...',
      date: new Date(Date.now() - 86400000).toISOString(),
      unread: false,
    },
  ]

  return new Response(JSON.stringify({
    unreadCount: 5,
    emails: mockEmails,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

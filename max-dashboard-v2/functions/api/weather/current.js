export async function onRequestGet({ request }) {
  // Get location from query params or default to Indio, CA
  const url = new URL(request.url)
  const lat = url.searchParams.get('lat') || '33.7205' // Indio, CA
  const lon = url.searchParams.get('lon') || '-116.2156'

  try {
    // Use Open-Meteo (free, no API key needed)
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
    )

    if (!weatherResponse.ok) {
      throw new Error('Weather API error')
    }

    const weatherData = await weatherResponse.json()
    const current = weatherData.current

    // Map WMO weather codes to conditions
    const getCondition = (code) => {
      const conditions = {
        0: 'Clear',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Drizzle',
        53: 'Drizzle',
        55: 'Drizzle',
        61: 'Rain',
        63: 'Rain',
        65: 'Rain',
        71: 'Snow',
        73: 'Snow',
        75: 'Snow',
        80: 'Rain Showers',
        81: 'Rain Showers',
        82: 'Rain Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm',
        99: 'Thunderstorm',
      }
      return conditions[code] || 'Unknown'
    }

    return new Response(JSON.stringify({
      temp: Math.round(current.temperature_2m),
      condition: getCondition(current.weather_code),
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      location: 'Indio, CA',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Fallback to default
    return new Response(JSON.stringify({
      temp: 72,
      condition: 'Sunny',
      humidity: 25,
      wind: 8,
      location: 'Indio, CA',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

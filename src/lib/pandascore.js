const PANDA_SCORE_API_KEY = 'iGHCyQp-Sx5LCb1Wg04KSAZqEYgE-3NVX_ky282erv8mBb0uikk'
const BASE_URL = 'https://api.pandascore.co'

export async function getLiveMatches() {
  try {
    const response = await fetch(`${BASE_URL}/valorant/matches/live?token=${PANDA_SCORE_API_KEY}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('PandaScore hatası:', error)
    return []
  }
}

export async function getUpcomingMatches() {
  try {
    const response = await fetch(`${BASE_URL}/valorant/matches/upcoming?token=${PANDA_SCORE_API_KEY}&per_page=6`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('PandaScore hatası:', error)
    return []
  }
}
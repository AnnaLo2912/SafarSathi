const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

export async function getPlaceImage(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`
    )
    const data = await res.json()

    return data.results?.[0]?.urls?.regular || null
  } catch (err) {
    console.error('Unsplash error:', err)
    return null
  }
}
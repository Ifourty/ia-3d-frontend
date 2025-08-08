export async function testConnectionBackend() {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ia/test`, { method: 'GET' })
  const data = await response.json()
  return data
}
export const fetcher = async (
   ...args: [RequestInfo | URL, RequestInit?]
): Promise<any[]> => {
   const response = await fetch(...args)
   return response.json()
}

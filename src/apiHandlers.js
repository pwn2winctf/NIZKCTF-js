export const responseWrapper = config => async response => {
  if (response.ok) {
    return response
  }

  throw new Error(response)
}

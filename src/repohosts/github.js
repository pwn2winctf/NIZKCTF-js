import { create } from 'apisauce'

const API_URL = 'https://api.github.com'

export class GitHub {
  constructor (token = undefined) {
    this.api = create({
      baseURL: API_URL
    })

    if (token) {
      this.setToken(token)
    }
  }

  setToken (token) {
    this.api.setHeader('Authorization', 'bearer ' + token)
  }

  getUser () {
    return this.api.get('/user').then(response => console.log(response))
  }
}

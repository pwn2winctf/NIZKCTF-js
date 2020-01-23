import { create } from 'apisauce'
const API_URL = 'https://api.github.com'

export class GitHub {
  constructor (token) {
    this.api = create({
      baseURL: API_URL,
      headers: {
        Authorization: 'bearer ' + token
      }
    })
  }
  
  getUser () {
    return this.api.get('/user').then(response => console.log(response))
  }
}


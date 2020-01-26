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
    return this.api.get('/user')
  }

  async fork (sourceRepo) {
    const url = '/repos/' + sourceRepo + '/forks'
    const { data, status } = await this.api.post(url)

    return { status, fullName: data.full_name, sshUrl: data.ssh_url }
  }

  static getSshUrl (sourceRepo) {
    return 'git@github.com:' + sourceRepo + '.git'
  }
}

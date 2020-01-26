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

  fork (sourceRepo) {
    const url = '/repos/' + sourceRepo + '/forks'
    return this.api.post(url)
  }

  mergeRequest (
    sourceRepo,
    targetRepo,
    sourceBranch = 'master',
    targetBranch = 'master',
    title = 'Pull Request'
  ) {
    const username = sourceRepo.split('/')[0]
    const head = username + ':' + sourceBranch
    const url = '/repos/' + targetRepo + '/pulls'

    return this.api.post(url, { title, head, base: targetBranch })
  }

  commentMergeRequest (repo, mergeRequestId, body) {
    const url = '/repos/' + repo + '/issues/' + mergeRequestId + '/comments'
    return this.api.post(url, { body })
  }

  closeMergeRequest (repo, mergeRequest) {
    const url = '/repos/' + repo + '/pulls/' + mergeRequest
    return this.api.patch(url, { state: 'closed' })
  }

  static getSshUrl (sourceRepo) {
    return 'git@github.com:' + sourceRepo + '.git'
  }
}

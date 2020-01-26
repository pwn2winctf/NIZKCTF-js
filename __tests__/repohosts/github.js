const { GitHub } = require('../../src/repohosts/github')

describe('GitHub', function () {
  beforeEach(() => {
    this.repo = new GitHub(process.env.TOKEN)
    this.username = process.env.GITHUB_USER
  })

  test("should get user's data", async done => {
    const response = await this.repo.getUser()
    expect(response.status).toBe(200)
    done()
  })

  test('should forks repository', async done => {
    const sourceRepo = 'pwn2winctf/NIZKCTF'
    const response = await this.repo.fork(sourceRepo)
    expect(response.status).toBe(202)
    done()
  })

  test('should return ssh url', () => {
    const expectSshUrl = 'git@github.com:pwn2winctf/NIZKCTF.git'

    const sourceRepo = 'pwn2winctf/NIZKCTF'
    const sshUrl = GitHub.getSshUrl(sourceRepo)

    expect(sshUrl).toBe(expectSshUrl)
  })

  test('should does a merge request', async done => {
    const sourceRepo = this.username + '/NIZKCTF-1'
    const sourceBranch = 'master'

    const targetRepo = 'test/test'
    const targetBranch = 'master'

    const title = 'My merge request'

    const response = await this.repo.mergeRequest(
      sourceRepo,
      targetRepo,
      sourceBranch,
      targetBranch,
      title
    )
    expect(response.status).toBe(404)
    expect(response.data.message).toBe('Not Found')
    done()
  })
})

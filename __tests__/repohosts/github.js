const { GitHub } = require('../../src/repohosts/github')

describe('GitHub', function () {
  beforeEach(() => {
    this.repo = new GitHub(process.env.TOKEN)
  })

  test('should get user\'s data', async done => {
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
})
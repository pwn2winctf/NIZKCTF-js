const { GitHub } = require('../src/repohosts/github')
const { Challenges } = require('../src/challenges')

describe('Challenges', function () {
  beforeEach(() => {
    this.repo = new GitHub()
    this.challenges = new Challenges(this.repo, 'pwn2winctf/2019')
  })

  test('should list challenges', async done => {
    const challenges = [
      { name: 'astrobot', descriptions: ['en', 'pt'] },
      { name: 'baby_recruiter', descriptions: ['en', 'pt'] },
      { name: 'bilinear_evil', descriptions: ['en', 'pt'] },
      { name: 'botnet', descriptions: ['en', 'pt'] },
      { name: 'calc', descriptions: ['en', 'pt'] },
      { name: 'cloud_admin', descriptions: ['en', 'pt'] },
      { name: 'federated_sophia', descriptions: ['en', 'pt'] },
      { name: 'full_troll', descriptions: ['en', 'pt'] },
      { name: 'future_message_pt1', descriptions: ['en', 'pt'] },
      { name: 'future_message_pt2', descriptions: ['en', 'pt'] },
      { name: 'future_message_pt3', descriptions: ['en', 'pt'] },
      { name: 'future_message_pt4', descriptions: ['en', 'pt'] },
      { name: 'g00d_b0y', descriptions: ['en', 'pt'] },
      { name: 'hardware_trojan_pt1', descriptions: ['en', 'pt'] },
      { name: 'hardware_trojan_pt2', descriptions: ['en', 'pt'] },
      { name: 'harpa_hyper_login_system', descriptions: ['en', 'pt'] },
      { name: 'i_shall_never_be_anything', descriptions: ['en', 'pt'] },
      { name: 'index', descriptions: [] },
      { name: 'inherit_the_stars', descriptions: ['en', 'pt'] },
      { name: 'matroska', descriptions: ['en', 'pt'] },
      { name: 'message_keeper', descriptions: ['en', 'pt'] },
      { name: 'random_crypto', descriptions: ['en', 'pt'] },
      { name: 'random_vault', descriptions: ['en', 'pt'] },
      { name: 'real_ec', descriptions: ['en', 'pt'] },
      { name: 'rmbellious', descriptions: ['en', 'pt'] },
      { name: 'roots_before_branches', descriptions: ['en', 'pt'] },
      { name: 'the_last_resort', descriptions: ['en', 'pt'] },
      { name: 'vamos_pra_russia', descriptions: ['en', 'pt'] }
    ]
    const baseURL =
      'https://api.github.com/repos/pwn2winctf/2019/contents/challenges'
    const ref = 'master'
    const expected = challenges.map(item => {
      const descriptions = item.descriptions.reduce((map, lang) => {
        const fileName = `${item.name}.${lang}`
        map[lang] = {
          path: `challenges/${fileName}.md`,
          url: `${baseURL}/${fileName}.md?ref=${ref}`
        }
        return map
      }, {})
      return {
        name: item.name,
        path: `challenges/${item.name}.json`,
        url: `${baseURL}/${item.name}.json?ref=${ref}`,
        descriptions
      }
    })
    const list = await this.challenges.list()

    expect(list).toStrictEqual(expected)
    done()
  })
})

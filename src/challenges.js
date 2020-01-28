const CHALLENGES_DIR = 'challenges/'
const DEFAULT_LANGUAGE = 'en'

export class Challenges {
  constructor (repoHost, repository) {
    this.repoHost = repoHost
    this.repository = repository
  }

  async list (ref = 'master') {
    const { data } = await this.repoHost.listFiles(
      this.repository,
      CHALLENGES_DIR,
      ref
    )

    const jsonFiles = data.filter(file => file.name.endsWith('.json'))
    const descriptionFiles = data.filter(file => file.name.endsWith('.md'))

    const challenges = jsonFiles.map(challenge => {
      const fileName = challenge.name.slice(
        0,
        challenge.name.lastIndexOf('.json')
      )

      const descriptions = descriptionFiles
        .filter(description => description.name.startsWith(fileName))
        .reduce((map, description) => {
          const language = description.name
            .slice(0, description.name.lastIndexOf('.md'))
            .substring(fileName.length + 1)
          map[language] = {
            path: description.path,
            url: description.download_url
          }
          return map
        }, {})
      return {
        name: fileName,
        path: challenge.path,
        url: challenge.url,
        descriptions
      }
    })

    this.challenges = challenges

    return challenges
  }

  get (name, language = DEFAULT_LANGUAGE) {
    if (this.challenges === undefined) {
      throw new Error('First execute list')
    }

    const challenges = this.challenges.filter(
      challenge => challenge.name === name
    )

    if (challenges.length === 0) {
      throw new Error('Challenge not found')
    }

    const selectedChallenge = challenges[0]

    const selectedDescription =
      selectedChallenge.descriptions[language] ||
      selectedChallenge.descriptions[DEFAULT_LANGUAGE] ||
      Object.values(selectedChallenge.descriptions)[0]
    if (selectedDescription === undefined) {
      throw new Error('Description not found')
    }

    const challenge = {
      ...selectedChallenge,
      description: selectedDescription.url
    }
    delete challenge.descriptions

    return challenge
  }
}

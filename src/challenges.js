const CHALLENGES_DIR = 'challenges/'

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
          map[language] = { path: description.path, url: description.url }
          return map
        }, {})
      return {
        name: fileName,
        path: challenge.path,
        url: challenge.url,
        descriptions
      }
    })

    return challenges
  }
}

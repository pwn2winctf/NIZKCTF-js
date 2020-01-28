import { GitHub } from './repohosts/github'
import { Challenges } from './challenges'

const repo = new GitHub(process.env.TOKEN)
this.challenges = new Challenges(repo, 'pwn2winctf/2019')

this.challenges
  .list()
  .then(list => {
    list.forEach(challenge => {
      console.log(challenge.name)
      const languages = Object.keys(challenge.descriptions)
      languages.forEach((lang, idx) => {
        if (idx + 1 < languages.length) {
          console.log(' ', String.fromCharCode(0x2523), lang)
        } else {
          console.log(' ', String.fromCharCode(0x2517), lang)
        }
      })
    })
  })
  .catch(err => console.log(err))

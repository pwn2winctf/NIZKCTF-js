## FAQ

If you want to learn more about our Non-Interactive Zero-Knowledge (NIZK) platform, read this paper: [https://arxiv.org/pdf/1708.05844.pdf](https://arxiv.org/pdf/1708.05844.pdf)


**1 - Why do I need to login with my GitHub account?**

GitHub is among the technologies we use to make our platform auditable by anyone. The only permission we need is access to your public repositories, and we will only ever touch your fork of the Pwn2Win submissions repository.

If you don't have an account or are uncomfortable using your work account, you can [create an account](https://github.com/join) for playing the CTF - it's very straightforward, just as quick as if you were registering on ctfd.


**2 - [IMPORTANT] Where is the "team secret" stored?**

We store the team secret in the "localStorage" of your browser. Keep this fact in mind if you plan to use another box or another browser on the competition's day. **We recommend you to backup the team-secrets at the exact moment you register the team**.


**3 - How much time does it take for the points to appear in the scoreboard after a correct flag is submitted?**

If you get the message "Flag found, submitted," please wait a couple of minutes. It may take a little for the bot to check your flag submission, GitHub Pages to get redeployed, and your browser to poll the updated scoreboard.


**4 - When do the member nicknames appear on the team details window?**

Nicknames appear when the player submits any correct flag. The nickname of the member who registered the team is also recorded.


**5 - How much time does the scoreboard take to update?**

We poll the scoreboard from GitHub Pages every minute. If you get a successful websocket connection, it will update much more quickly.


**6 -  Can you guys provide the source code of the platform and web-client?**

No problem, everything is open source. Take a look at:
 * Platform source: [https://github.com/pwn2winctf/NIZKCTF](https://github.com/pwn2winctf/NIZKCTF)
 * Web-client source: [https://github.com/pwn2winctf/NIZKCTF-js](https://github.com/pwn2winctf/NIZKCTF-js)


**7 - I have played previous editions and liked the command-line client. Is it still available?**

The command-line client is available at [https://github.com/pwn2winctf/2020](https://github.com/pwn2winctf/2020), but if you need to convert your "team secret" from the web version to the command line version, or vice-versa, your are on your own (consider this as part of the CTF).

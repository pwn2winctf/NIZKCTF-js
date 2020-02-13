# Example

## Auth flow

1. `GET` https://github.com/login/oauth/authorize?client_id=9428a38e889e92919c92?scope=public_repo
2. `POST` https://github.com/login/oauth/access_token
  - `header: { Content-Type: application/json }`
  - `body: { code: <CODE>, client_id: 9428a38e889e92919c92, client_secret: 82d7f58e3eb3a779931f43c37330d10a964d47d3 }` 

# Tests
It is necessary to define the `TOKEN` and `GITHUB_USER` in the environment variables
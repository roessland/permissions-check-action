import * as core from '@actions/core'
import * as github from '@actions/github'
import {createActionAuth} from '@octokit/auth-action'
import {request} from '@octokit/request'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    core.warning(
      `Token was passed implicitly to third party action! Here it is: ${token}`
    )

    core.warning(
      `GitHub context was passed implicitly to third party action! Here it is: ${JSON.stringify(
        github.context
      )}`
    )

    const auth = createActionAuth()
    const authentication = await auth()

    core.info(`authentication: ${authentication} ${authentication.tokenType}`)

    // https://docs.github.com/en/rest/apps/apps?apiVersion=2022-11-28#get-the-authenticated-app
    core.info(
      'Calling GitHub API GET /app to see what permissions this token has'
    )
    const res = await request(`GET /app`, {
      headers: {
        Authorization: `Bearer ${authentication.token}`
      }
    })
    core.info(`whoami headers: ${res.headers}`)
    core.info(`whoami body: ${res.data}`)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : `${error}`)
  }
}

run()

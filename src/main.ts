import * as core from '@actions/core'
import * as github from '@actions/github'
import {exec} from '@actions/exec'
import {request} from '@octokit/request'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    core.info(`token has length ${token.length}`)
    core.warning(
      `Token was passed implicitly to third party action! Here it is: ${token}`
    )

    core.warning(
      `GitHub context was passed implicitly to third party action! Here it is: ${JSON.stringify(
        github.context
      )}`
    )

    // Dump contents of current directory
    try {
      core.info(
        'listing files with git ls-files to see if third party action can see checked out files'
      )
      await exec('pwd')
      await exec('ls')
      await exec('git', ['ls-files'])
    } catch (error: unknown) {
      core.warning('get current directory failed')
      core.warning(error instanceof Error ? error : `${error}`)
    }

    try {
      const octokit = github.getOctokit(token)
      const req = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
      })
      core.info(`whoami body: ${JSON.stringify(req.data)}`)
      core.info(`${JSON.stringify(req.headers)}`)
    } catch (error: unknown) {
      core.warning('github.getOctokit failed')
      core.warning(error instanceof Error ? error : `${error}`)
    }

    try {
      // https://docs.github.com/en/rest/apps/apps?apiVersion=2022-11-28#get-the-authenticated-app
      core.info(
        'Calling GitHub API GET / to see what permissions this token has'
      )
      const res = await request(`GET /repos/{owner}/{repo}/commits`, {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      core.info(`whoami headers: ${JSON.stringify(res.headers)}`)
      core.info(`whoami body: ${JSON.stringify(res.data)}`)
    } catch (error: unknown) {
      core.warning('await request failed')
      core.warning(error instanceof Error ? error : `${error}`)
    }
  } catch (error) {
    core.warning(error instanceof Error ? error.message : `${error}`)
  }
}

run()

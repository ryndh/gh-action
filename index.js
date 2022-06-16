const path = require('path')
const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')

const run = async () => {
  try {
    const context = github.context

    const myToken = core.getInput('token')
    // const pr = core.getInput('pr')
    const files = core.getInput('files').replace(' ', '').split(',')

    const octokit = github.getOctokit(myToken)
    const root = process.env.GITHUB_WORKSPACE
    // const { data: pullRequest } = await octokit.rest.pulls.listFiles({
    //   ...context.repo,
    //   pull_number: pr,
    // });

    // const onlyLocales = pullRequest.every((file) => {
    //   return file.filename.includes('locales')
    // })
    // console.log(`was locales only`, onlyLocales)
    // if (onlyLocales) {

    // }
    const filesChanged = await exec.exec('git', ['diff', 'master', '--name-only'])
    console.log('changed', filesChanged)

    const parser = {
      read: JSON.parse,
      write: (data) => JSON.stringify(data, null, 2),
    }

    core.info('Updating files version field')
    const changed = files.reduce((change, file) => {
      const dir = path.join(root, file)
      const buffer = fs.readFileSync(dir, 'utf-8')

      const content = parser.read(buffer)

      // if (content.version === version) {
      //   core.info(`  - ${file}: Skip since equal versions`)
      //   return change
      // }
      const newVersion = content.version
        .split('.')
        .map((num, i) => {
          if (i !== 2) {
            return num
          }
          return parseInt(num, 10) + 1
        })
        .join('.')

      core.info(`  - ${file}: Update version from "${content.version}" to "${newVersion}"`)
      content.version = newVersion
      fs.writeFileSync(dir, parser.write(content))
      return true
    }, false)

    if (!changed) {
      core.info('Skipped commit since no files were changed')
      return
    }

    core.info('Committing file changes')
    await exec.exec('git', ['config', '--global', 'user.name', 'github-actions[bot]'])
    await exec.exec('git', [
      'config',
      '--global',
      'user.email',
      '41898282+github-actions[bot]@users.noreply.github.com',
    ])
    await exec.exec('git', ['commit', '-m', `bump version`])
    await exec.exec('git', ['push'])
  } catch (error) {
    core.setFailed(error.message)
  }
}
run()

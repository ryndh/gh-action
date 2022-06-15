const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  try {
    const context = github.context;
    // console.log(context);
    
    const myToken = core.getInput('token');
    const octokit = github.getOctokit(myToken)
    core.debug(`token ${token}`)
    const { data: pullRequest } = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: context.number,
    });
    console.log(pullRequest)
    console.log('we ran')
    
  } catch (error) {
    core.setFailed(error.message);
  }
}
run()
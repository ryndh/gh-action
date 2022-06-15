const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  try {
    const context = github.context;
    // console.log(context);
    
    const myToken = core.getInput('token');
    const octokit = github.getOctokit(myToken)
    
    const { data: pullRequest } = await octokit.rest.pulls.get({
      ...context.repo,
      repo: context.repository.full_name,
      pull_number: context.number,
    });
    console.log(pullRequest)
    console.log('we ran')
    
  } catch (error) {
    core.setFailed(error.message);
  }
}
run()
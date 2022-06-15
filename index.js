const core = require('@actions/core');
const github = require('@actions/github');

try {
  const context = github.context;
  console.log(context);

  const myToken = core.getInput('token');
  const octokit = github.getOctokit(myToken)
  console.log('we ran')

} catch (error) {
  core.setFailed(error.message);
}
---
title: Reopen Pull Requests with the Github API
date: 2018-12-29
excerpt: Using the Github API to reopen auto-closed Pull Requests
tags: ["tech", "github", "api"]
---

# Problem Statement

At work, we typically deploy once a day from a `hotfix` branch that looks something like `hotfix/2.9.1.3`. Once deployed to `master`, the branch is deleted, the hotfix version number is incremented, and a new branch `hotfix/2.9.1.4` is created. Some of this creation / deletion of branches is automated by `hubflow` for us.

This process has an annoying side effect - all current open pull requests to `hotfix/2.9.1.3` will be automatically closed by Github, as the base branch (the branch you would like to merge code into) no longer exists. After a deployment, we would have to go to Github and manually reopen all of the closed pull requests.

# The Solution

Of course, there must be a better way. We need two things from Github, and done in the following order:

1. Change the base branch of a closed pull request
2. Reopen a closed pull request


To help us interact with the Github API, I used [pygithub](https://github.com/PyGithub/PyGithub). I set up a class to encapsulate the logic:


``` python
class GithubAPI(object):
    """
    Interact with the Github API
    """
    def __init__(self):
        self.access_token = settings.ACCESS_TOKEN
        self.username = settings.ACCESS_USERNAME

        # instantiate instance to communicate with Github
        self.github = Github(self.access_token)

        # instantiate instance to our repo
        self.repo = self.github.get_repo("our/repo")
```

Before we can do anything, we need to get the branches that are relevant to our problem. We need to get all unmerged Pull Requests (PR's) to a particular branch. We can use `get_pulls` from `pygithub` to help us out. Here's how to that:


``` python
    def get_unmerged_closed_pull_requests(self, base_branch):
        """
        Get a list of unmerged, closed pull requests to a particular base_branch
        Args:
            (str) - base_branch - the base branch of the form hotfix/2.9.3.1
        Returns:
            (List[PullRequest]) - list of PullRequest objects
        """

        # these will be both merged and unmerged
        query = self.repo.get_pulls(state="closed", base=base_branch)

        # unmerged prs should have a None merged_at attribute
        return [pr for pr in query if not pr.merged_at]
```

Now that we can get PR's we are interested in, we need change each PR's base branch and reopen it. `pygithub` exposes an `edit` function on the `PullRequest` class to modify attributes of a pull request, so let's use it:

``` python
    def update_base_branches_and_open_prs(self, base_branch, new_base_branch):
        """
        Get all the PR's to the base_branch, change their branch bases to
        new_base_branch, and open them
        Args:
            (str) - base_branch - the base branch of the form hotfix/2.9.3.1
            (str) - new_base_branch - the new base branch to set prs to of form hotfix/2.9.3.2
        """

        relevant_prs = self.get_unmerged_closed_pull_requests(base_branch)

        # update to new_base_branch and reopen
        for pr in relevant_prs:
            try:
                log.info(u"Updating PR: {0}".format(pr.title))
                pr.edit(base=new_base_branch)
                pr.edit(state="open")

            except Exception:
                log.exception(u"Unable to update Pr {title}".format(title=pr.title))

```

The function `update_base_branches_and_open_prs` accepts the previous and new base branches and attempts to reopen each of the PR's from `get_unmerged_closed_pull_requests`.

We can now run this from a python intepretor:

``` python
In [1]: from app.somewhere import GithubAPI
In [2]: g = GithubAPI()
In [3]: g.update_base_branches_and_open_prs("hotfix/2.9.3.10", "hotfix/2.9.3.11")
```

Nice! We can attach this to our deployment process and have a function automatically run these commands. However, the process does not currently *only* reopen autoclosed pull requests. Can you find the edge case that we missed?

## One more case: non-autoclosed Pull Requests

What if you closed a pull request because you were either not ready to merge it, or it is no longer relevant? The script would still reopen your PR, and that is not what we want. We can solve this by tapping into the events of a Pull Request and only reopen PR's that were autoclosed.

I couldn't find something that indicated whether a Pull Request was autoclosed, but it turned out that we have one specific Github user that closed Pull Requests (the admin of the repo) which we only used for administrative tasks. We can choose PR's that were only closed by this Github user:


``` python
    def update_base_branches_and_open_prs(self, base_branch, new_base_branch):
        """
        Get all the PR's to the base_branch, change their branch bases to
        new_base_branch, and open them
        Args:
            (str) - base_branch - the base branch of the form hotfix/2.9.3.1
            (str) - new_base_branch - the new base branch to set prs to of form hotfix/2.9.3.2
        """

        relevant_prs = self.get_unmerged_closed_pull_requests(base_branch)

        # update to new_base_branch and reopen
        for pr in relevant_prs:
            try:

                # we only want to update PR's that were closed by githubadmin as they are auto-closed
                events = self.get_events_for_pull_request(pr)
                last_event = events[-1]
                if last_event["event"] == "closed" and last_event["actor"]["login"] == "githubadmin":
                    log.info(u"Updating PR: {0}".format(pr.title))
                    pr.edit(base=new_base_branch)
                    pr.edit(state="open")
                else:
                    log.info(u"PR {0} was not autoclosed, skipping".format(pr.title))
            except Exception:
                log.exception(u"Unable to update Pr {title}".format(title=pr.title))
```


Last thing to do is to actually get the events for a pull request. `pygithub` didn't seem to provide a direct way to get these, so we have to make a request to the Github API for this information:

``` python
    def get_events_for_pull_request(self, pull_request):
        """
        Get the events associated with a particular PullRequest object
        Args:
            pull_request (github.PullRequest.PullRequest) - representation of a Pull Request
        Returns:
            HTTP response with events for a Pull Request
        """
        issue_url = pull_request._rawData['issue_url']

        request_url = "{0}/events".format(issue_url)
        auth_obj = HTTPBasicAuth(
            self.username,
            self.access_token
        )
        try:
            response = json.loads(requests.get(request_url, auth=auth_obj).content)
        except Exception:
            log.info(u"Unable to get events for PR {title}".format(title=pull_request.title))
            response = None

        return response
```

And we're done!

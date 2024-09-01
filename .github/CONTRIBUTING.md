# Redocly CLI Contributing Guide

Hi! We're really excited that you are interested in contributing to Redocly CLI. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

- [Issue reporting guidelines](#issue-reporting-guidelines)
- [Pull request guidelines](#pull-request-guidelines)
- [Development setup](#development-setup)
- [Tests](#tests)
- [Project structure](#project-structure)

## Issue reporting guidelines

- Before opening a new issue, try to make sure the same problem or idea hasn't already been reported. You can do that on the [Issues page](https://github.com/Redocly/openapi-sampler/issues) in the repository and using the filter `is:issue` combined with some keywords relevant to your idea or problem. It helps us notice that more people have the same issue or use-case, and reduces the chance of getting your issue marked as a duplicate. Plus, you can even find some workarounds for your issue in the comments of a previously reported one!

- The best way to get your bug fixed is to provide a (reduced) test case. This means listing and explaining the steps we should take to try and hit the same problem you're having. It helps us understand in which conditions the issue appears, and gives us a better idea of what may be causing it.

- Abide by our [Code of Conduct](https://redocly.com/code-of-conduct/) in all your interactions on this repository, and show patience and respect to other community members.

## Pull request guidelines

Before submitting a pull request, please make sure the following is done:

1. Fork the repository and create your branch from `main`.
1. Run `npm install` in the repository root.
1. If you’ve fixed a bug or added code that should be tested, don't forget to add [tests](#tests)!
1. Ensure the test suite passes (see the [Tests section](#tests) for more details).


1. Format your code with prettier (`npm run prettier`).
1. Each feat/fix PR should also contain a changeset (to create one, run `npx changeset`). Please describe what you've done in this PR using sentence case (you can refer to our [changelog](https://redocly.com/docs/cli/changelog/)). This produces a file in `.changeset` folder. Please commit this file along with your changes. If the PR doesn't need a changeset (for example, it is a small change, or updates only documentation), add the 'No Changeset Needed' label to the PR.
1. When merging a PR, make sure to remove all redundant commit information (like intermediate commit descriptions). Please leave only the main commit description (plus co-authors if needed). If you think it makes sense to keep several commit descriptions, please rebase your PR instead of squashing it to preserve the commits. Please use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.

## Development setup

A current version of [Node.js](http://nodejs.org) and NPM are required.

After forking the repo, run:

```bash
npm install # or npm i
```

### NPM linking

To test the local source code of the packages in other local applications, you can use npm linking. See the [docs](https://docs.npmjs.com/cli/v9/commands/npm-link).

## Contribute documentation

Additions and updates to our documentation are very welcome. You can find the documentation in the `README.md` file.

## Tests

The project uses Mocha for tests.

Run unit tests with this command: `npm run test`.

## Project structure

- **`src/`**: contains the source code of the project. The codebase is written in JavaScript.

- **`src/samplers`**: contains the source code of the samplers for different data types.

- **`tests/`**: contains unit tests for the project.

- **`dist/`**: contains the compiled JavaScript code after building the project.

- **`gulp/`**: likely contains Gulp tasks for building, testing, and other development processes.

- **`.github/`**: contains GitHub-specific files, such as this `CONTRIBUTING.md`.

- **`coverage/`**: contains code coverage reports generated after running tests.

- **`node_modules/`**: contains all the npm packages that the project depends on.

- **`package.json`**: defines the project's npm dependencies, scripts, and other metadata.

- **`gulpfile.js`**: contains the Gulp configuration for various build and development tasks.

- **`README.md`**: provides an overview of the project, its features, and usage instructions.

- **`.travis.yml`**: configuration file for Travis CI, used for continuous integration and testing.

- **`.editorconfig`**: defines coding styles for different file types to maintain consistency across different editors and IDEs.

The project uses Gulp for task automation, Mocha for testing, and follows JavaScript coding standards. It's designed to work with OpenAPI (formerly known as Swagger) specifications to generate sample data based on schema definitions.

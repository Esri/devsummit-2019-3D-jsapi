Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Usage

The presentations are built using [reveal-md](https://github.com/webpro/reveal-md). Use the following commands to run them locally:

```
npm install
npm run start
```

This will launch the default browser and serve the presentations at http://localhost:1948

**Deploying a new version**

We use GitHub pages to serve the reveal.js presentations using a dedicated branch for the deployment (as described in [this](https://medium.com/linagora-engineering/deploying-your-js-app-to-github-pages-the-easy-way-or-not-1ef8c48424b7) tutorial).

To deploy a new version, first make sure you have the `gh-pages` branch checked out in the `dist` folder.

```
rm -rf dist
git worktree add dist gh-pages
```

After that build the project in the root folder.

```
npm run dist
```

No `cd` into the `dist` folder and push the new version to the `gh-pages` branch:

```
cd dist
git add .
git commit -am '💥'
git push origin gh-pages
```

# Hot 100 blog

Use Node 24 and npm. Content is in `src/content/problems/`, one Markdown file per problem.
Keep the 100 problems and their 17 categories in the order recorded by `src/data/problem-index.json`.
Use stable `problem-ID` anchors and `withBase()` for internal URLs.
Run `npm run ci` for changes affecting content or application code.
Never claim a LeetCode acceptance or personal completion without actual evidence.
Deployment is GitHub Pages; its configured repository prefix is `/hot100-blog/`.

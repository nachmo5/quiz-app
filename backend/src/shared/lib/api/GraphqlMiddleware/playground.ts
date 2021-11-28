import express from 'express';

export default (graphqlRoute: string) => (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Security-Policy', "'unsafe-inline' script-src 'self' https://unpkg.com");
  res.send(`<html>
    <head>
      <title>Simple GraphiQL Example</title>
      <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
    </head>
    <body style="margin: 0;">
      <div id="graphiql" style="height: 100vh;"></div>
      <script
        crossorigin
        src="https://unpkg.com/react/umd/react.production.min.js"
      ></script>
      <script
        crossorigin
        src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
      ></script>
      <script
        crossorigin
        src="https://unpkg.com/graphiql/graphiql.min.js"
      ></script>
      <script>
        const graphQLFetcher = graphQLParams =>
          fetch('${graphqlRoute}', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphQLParams),
          })
            .then(response => response.json())
            .catch(() => response.text());
        ReactDOM.render(
          React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
          document.getElementById('graphiql'),
        );
      </script>
    </body>
  </html>`);
};

# DFK Wikidata Entities

TODO: description

# Data

TODO

# Development

The application consists of a small ruby data munger script a frontend to be
embedded in virtually any website (static, cms, groupware etc.). Below, we
provide basic instructions on how to get a development environment up and
running.

## Requirements

More recent versions will likely also work, here is what we used during
development

* ruby 3.0
* nodejs v16.19

## Setup

Install required libraries

    bundle install
    npm install

Once this is done, start the frontend development server
with

    npm run dev

so that the frontend is available at http://127.0.0.1:4000.

# Production

To run the application in production, run

    npm run build

and then upload the contents of the `public/` directory to a web server of your
choice. Make sure the web server sends the `Access-Control-Allow-Origin: *`
header so that other pages can load the application code and data.

Once that is done, you can integrate the app into your website. Let's say you
deployed it to https://myapp.example.com, then add the following snippets to
your page:

```html
<!DOCTYPE html>
<html>
  <head>
    ...
  </head>
  <body>
    ...
    <div is="app"></div>
    ...
    <script src="https://myapp.example.com/app.js"></script>
  </body>
</html>
```

The two component `app` can be placed anywhere in your page.

# Data

After making changes to `data/records.csv`, which is the source of data for the
person data, run `npm run import` to convert the data to a suitable json format
that the app can consume.
define({
  "name": "OpenBadges API",
  "version": "1.0.0",
  "description": "",
  "title": "OpenBadges API documentation",
  "url": "http://localhost:3001",
  "order": [
    "Sign up",
    "Sign in",
    "Sign out",
    "Refresh token",
    "Request reset password",
    "Reset password",
    "Get details"
  ],
  "template": {
    "withCompare": false,
    "forceLanguage": "en"
  },
  "header": {
    "title": "Introduction",
    "content": "<h1>OpenBadges API</h1>\n<p><br />Documentation of the routes and methods to manage <a href=\"#api-User\">users</a>, <a href=\"#api-Course\">courses</a>, <a href=\"#api-Badge\">badges</a> and <a href=\"#api-Admin\">admin</a> in the OpenBadges API.\nYou can find the API running at <a href=\"http://localhost:3001/\">http://localhost:3001/</a>.</p>\n<h2>Date</h2>\n<p>Please note that the API handles every Date in <a href=\"https://en.wikipedia.org/wiki/Coordinated_Universal_Time\">Coordinated universal time (UTC)</a> time zone. Dates in parameters should be in ISO 8601 notation.</p>\n<p>Example:</p>\n<pre><code>2020-01-12\n</code></pre>\n<h2>IDs</h2>\n<p>All users, courses and badges receive a unique public identifier. These identifiers are exactly 24 character long and only contain digits and characters a to f.</p>\n<p>Example:</p>\n<pre><code>5e1b0bafeafe4a84c4ac31a9\n</code></pre>\n<h2>Parameters</h2>\n<p>All requests assume the payload encoded as JSON with <code>Content-type: application/json</code> header. Parameters prepended with a colon (<code>:</code>) are parameters which should be specified through the URL.</p>\n<h2>Source code</h2>\n<p>You can find the whole source code of the API at GitHub in the <a href=\"https://github.com/dhenn12/OpenBadges\">OpenBadges</a> repository.</p>\n<p>If there is something unclear or there is a mistake in this documentation please open an <a href=\"https://github.com/dhenn12/OpenBadges/issues/new\">issue</a> in the GitHub repository.</p>\n"
  },
  "sampleUrl": false,
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2020-01-12T17:47:09.787Z",
    "url": "http://apidocjs.com",
    "version": "0.19.0"
  }
});

<br />Documentation of the routes and methods to manage [users](#api-User), [courses](#api-Course), [badges](#api-Badge) and [admin](#api-Admin) in the OpenBadges API.
You can find the API running at [http://localhost:3001/](http://localhost:3001/).

## Date

Please note that the API handles every Date in [Coordinated universal time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) time zone. Dates in parameters should be in ISO 8601 notation.

Example:

    2020-01-12


## IDs

All users, courses and badges receive a unique public identifier. These identifiers are exactly 24 character long and only contain digits and characters a to f.

Example:

    5e1b0bafeafe4a84c4ac31a9

## Parameters

All requests assume the payload encoded as JSON with `Content-type: application/x-www-form-urlencoded` header. Parameters prepended with a colon (`:`) are parameters which should be specified through the URL. Incorrect or missing parameters result in a response with the status code `422` and a message for further information.

## Source code

You can find the whole source code of the API at GitHub in the [OpenBadges](https://github.com/dhenn12/OpenBadges) repository.

If there is something unclear or there is a mistake in this documentation please open an [issue](https://github.com/dhenn12/OpenBadges/issues/new) in the GitHub repository.

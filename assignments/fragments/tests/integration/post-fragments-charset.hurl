# POST fragment with charset
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
charset: utf-8
# using BasicAuth to authenticate the user (the user data is in .htpasswd)
[BasicAuth]
user1@gmail.com:password123
# body of request
`This is a fragment!`
 
# Expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
header "Content-Type" contains "utf-8"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# Now lets GET the fragment we just posted by its URL from location
GET {{ url }}
[BasicAuth]
user1@gmail.com:password123

# Expect to get back an HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
header "Content-Type" contains "utf-8"


# POST valid and authenticated user fragment and should return expected result
POST http://localhost:8080/v1/fragments
Content-Type: application/json
# using BasicAuth to authenticate the user (the user data is in .htpasswd)
[BasicAuth]
user1@gmail.com:password123
# body of request - raw JSON content
`{"message": "This is a JSON fragment!"}`

 
# Expect to get back an HTTP 201
HTTP/1.1 201
# assertions to verify the response
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see http://localhost:8080
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 42 is the length of our fragment data: '{"message": "This is a JSON fragment!"}'
jsonpath "$.fragment.size" == 39

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
jsonpath "$.fragment.data" == "{\"message\": \"This is a JSON fragment!\"}"
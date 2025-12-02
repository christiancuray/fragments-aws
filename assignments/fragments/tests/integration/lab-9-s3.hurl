# 1. POST a new text fragment to create it
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
user1@gmail.com:password123

`Hello S3!`

HTTP/1.1 201
[Captures]
url: header "Location"

# 2. GET the fragment to confirm it was created
GET {{url}}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.data" == "Hello S3!"

# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200

# 4. GET the fragment again to confirm it's gone
GET {{url}}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 404
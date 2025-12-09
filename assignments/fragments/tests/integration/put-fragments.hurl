# Authenticated POST to /v1/fragments to create a fragment first
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@gmail.com:password123
`This is the original fragment!`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"

[Captures]
fragment_id: jsonpath "$.fragment.id"

# Update the fragment using PUT with new data
PUT http://localhost:8080/v1/fragments/{{ fragment_id }}
Content-Type: text/plain
[BasicAuth]
user1@gmail.com:password123
`This is the updated fragment!`

# Expect to get back an HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{ fragment_id }}"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 29

# Verify the fragment was actually updated by fetching it
GET http://localhost:8080/v1/fragments/{{ fragment_id }}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.data" == "This is the updated fragment!"

# Test updating JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@gmail.com:password123
`{"name": "John"}`

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "application/json"

[Captures]
json_fragment_id: jsonpath "$.fragment.id"

# Update JSON fragment
PUT http://localhost:8080/v1/fragments/{{ json_fragment_id }}
Content-Type: application/json
[BasicAuth]
user1@gmail.com:password123
`{"name": "Jane", "age": 30}`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{ json_fragment_id }}"
jsonpath "$.fragment.type" == "application/json"

# Verify JSON fragment was updated
GET http://localhost:8080/v1/fragments/{{ json_fragment_id }}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.status" == "ok"


# Test updating Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@gmail.com:password123
`# Original Title`

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "text/markdown"

[Captures]
md_fragment_id: jsonpath "$.fragment.id"

# Update Markdown fragment
PUT http://localhost:8080/v1/fragments/{{ md_fragment_id }}
Content-Type: text/markdown
[BasicAuth]
user1@gmail.com:password123
`# Updated Title\n\nWith some content`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{ md_fragment_id }}"
jsonpath "$.fragment.type" == "text/markdown"

# Verify Markdown fragment was updated
GET http://localhost:8080/v1/fragments/{{ md_fragment_id }}
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.data" matches "# Updated Title"

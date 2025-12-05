# 1. POST a JSON fragment to create it
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
owner@gmail.com:owner123

`{"service": "DynamoDB"}`

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

# 2. GET fragment 1 info (metadata only)
GET {{fragment1_url}}/info
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"

# 3. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
owner@gmail.com:owner123

`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"

# 4. GET fragment 2 info (metadata only)
GET {{fragment2_url}}/info
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"

# 5. GET all fragments without expansion (just IDs)
GET http://localhost:8080/v1/fragments
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" count == 2
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 6. DELETE fragment 1
DELETE {{fragment1_url}}
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.message" == "Fragment deleted successfully"

# 7. Try to GET deleted fragment 1
GET {{fragment1_url}}
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Fragment not found"

# 8. GET all fragments again without expansion
GET http://localhost:8080/v1/fragments
[BasicAuth]
owner@gmail.com:owner123

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" count == 1
jsonpath "$.fragments" contains "{{fragment2_id}}"


# Health Check Test
GET http://localhost:8080

# Should get back a HTTP 1.1 200 response
HTTP/1.1 200

# Should get back a non-cacheable response ( cache-control header)
Cache-Control: no-cache

# Extra checks to perform against the response
[Asserts]

# Expect the response with "status: ok"
jsonpath "$.status" == "ok"
# Expect the response with "author: Christian Daryl Curay"
jsonpath "$.author" == "Christian Daryl Curay"
# Expect the response with proper github url
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
# Expect the response with version
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/


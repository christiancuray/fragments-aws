# POST an Unsupported type fragment should return a 415 error code
POST http://localhost:8080/v1/fragments
Content-Type: unsupported/type
# using BasicAuth to authenticate the user (the user data is in .htpasswd)
[BasicAuth]
user1@gmail.com:password123
# body of request
`This is a fragment!`
 
# Expect to get back an HTTP 201
HTTP/1.1 415

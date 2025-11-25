# POST as unauthenticated user should return 401 error
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# using BasicAuth to authenticate the user
[BasicAuth]
user1@gmail.com:wrongPassword
# body of request
`This is a fragment!`
 
# Expect to get back an HTTP 401
HTTP/1.1 401



